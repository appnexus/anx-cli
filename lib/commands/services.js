var _ = require('lodash');
var fs = require('fs');
var tmp = require('tmp');
var editor = require('../editor');
var Table = require('../table');
var inflection = require('inflection');

module.exports = function (program) {
	'use strict';

	function metaTable(fields) {
		var table = new Table({
			head: ['Name', 'Type', 'Sort By', 'Filter By']
		});
		fields.forEach(function (field) {
			table.push([
				program.theme.getColor('columns', 'name', field.name), (field.type === 'array of objects') ? metaTable(field.fields).toString() : program.theme.getColor('types', field.type, field.type),
				program.theme.getColor('values', field.sort_by.toString(), field.sort_by.toString()),
				program.theme.getColor('values', field.filter_by.toString(), field.filter_by.toString())
			]);
		});
		return table;
	}

	function renderMetaData(serviceName) {
		program.apiWrapper(_.partial(program.api.getMeta, serviceName, program.member), function (res, body) {
			if (program.formatterName === 'table') {
				console.log(metaTable(body.response.fields).toString());
			} else {
				console.log(program.formatter(body.response.fields));
			}
		});
	}

	program
		.command('add-service <servicename>')
		.description('adds service to config')
		.action(function (serviceName) {
			serviceName = inflection.pluralize(serviceName);
			var services = program.config.get(services) || {};
			services[serviceName] = {};
			program.config.set('services', services);
			program.config.save();
		});

	program.on('unknown-command', function () {
		if (!_.isEmpty(program.args[0])) {
			var possibleService = program.args[0].toLowerCase().replace(/[^a-z-]/g, '').trim();
			var singularServiceName = inflection.singularize(possibleService);
			var pluralServiceName = inflection.pluralize(possibleService);

			program.cache = false;

			program.spinner.setStatus('Detecting Service "%s" ', singularServiceName);

			program.apiWrapper(_.partial(program.api.getMeta, singularServiceName, program.member), function (res, body) {
				if (program.api.statusOk(body)) {
					program.successMessage('Service Found: %s', singularServiceName);
					program.successMessage('Please re-run the command.');
					var saveObj = {};
					// console.log(body.response.fields.reduce(function (fields, field) { fields[field.name] = {}; return fields; }), {});
					saveObj[pluralServiceName] = {};

					program.config.set('services', saveObj);
					program.config.save();
				} else {
					program.errorMessage('Unknown Service: %s', singularServiceName);
					program.help();
				}
			});
		} else {
			program.help();
		}
	});

	// Load service commands
	_.keys(program.apiServices).forEach(function (serviceKey) {
		var service = program.apiServices[serviceKey];

		_.defaults(service, {
			singular: inflection.singularize(serviceKey),
			url: service.url || inflection.singularize(serviceKey)
		});

		program
			.command(service.singular + ' [id]')
			.description('get a single ' + _.capitalize(service.singular) + ' record by Id')
			.option('-e, --edit', 'edit record and save back to service')
			.action(function (idStrings) {
				var args =  Array.prototype.slice.call(arguments);
				var command = args.pop();
				var ids;
				program.service = serviceKey;

				if (program.meta) {
					return renderMetaData(service.url);
				}

				if (command.edit) {
					program.cache = false;
				}

				idStrings = (idStrings || '').split(',');
				ids = idStrings.map(function (idString) {
					return parseInt(idString);
				});

				for (var i = 0; i < ids.length; i++) {
					if (_.isNaN(ids[i])) {
						return program.errorMessage('Invalid Id: ' + idStrings[i]);
					}
				}

				var opts = {};
				opts.path = service.url + '?id=' + ids.join(',');
				if (service.memberRequired || program.member) {
					opts.memberId = program.member;
				}

				program.apiWrapper(_.partial(program.api.getJson, opts), function (res, body) {
					if (program.api.hasRecord(body)) {
						if (command.edit) {
							tmp.tmpName({ mode: 420, prefix: (program.service || '') + '-' + ids.join('-') + '-', postfix: '.json' }, function _tempFileCreated(err, path) {
								if (err) { throw err; }
								var originalRecord = body.response[service.url];
								fs.writeFileSync(path, JSON.stringify(originalRecord, null, 2));
								editor.editFileWith(program.config.settings.editor, path, function (err) {
									if (err) { throw new Error(err); }
									var editedRecord = JSON.parse(fs.readFileSync(path, 'utf8'));
									if (!_.isEqual(editedRecord, originalRecord)) {
										var body = {};
										body[service.url] = editedRecord;
										program.apiWrapper(_.partial(program.api.putJson, opts, JSON.stringify(body)), function (err, body) {
											console.log(program.formatter(body.response[service.url]));
											program.successMessage('Record saved');
										});
									} else {
										console.log('No changes made to record');
									}
								});
							});
						} else {
							if (body.response[service.url]) {
								console.log(program.formatter(body.response[service.url]));
							} else {
								console.log(program.formatter(body.response[serviceKey], null, null, 'id'));
							}
						}
					} else {
						console.log('No %s record found with id(s) %s', service.url.yellow, ids.join(',').yellow);
					}
				});
			});

		program
			.command(serviceKey)
			.description('get a list of ' + _.capitalize(service.singular) + ' records')
			.option('-c, --columns <columns>', 'display columns')
			.action(function () {
				var args =  Array.prototype.slice.call(arguments);
				var command = args.pop();
				var pageIndex = 0;

				program.service = serviceKey;

				if (command.columns === 'all' || command.columns === '*') {
					command.columns = null;
				} else if (command.columns) {
					command.columns = command.columns.split(',');
				} else if (service.listColumns) {
					command.columns = _.keys(service.listColumns);
				}

				var opts = {};
				opts.path = service.url + '?' + args.join('&');
				if (service.memberRequired || program.member) {
					opts.memberId = program.member || program.config.settings.member_id;
				}
				if (command.columns) { opts.fields = command.columns.join(','); }

				function getHeaderLabel(columnName) {
					return (service.listColumns && service.listColumns[columnName] && service.listColumns[columnName].label) || inflection.titleize(columnName);
				}

				function renderWithFormatter(records, formatter, pageIndex) {
					var header = [];
					var listColumns;

					if (command.columns) {
						listColumns = command.columns;
					} else {
						listColumns = _.keys(records[0]);
					}

					// Create table header
					listColumns.forEach(function (columnName) {
						header.push(getHeaderLabel(columnName));
					});

					// Prune record columns
					records = records.map(function(item) {
						var record = {};
						listColumns.forEach(function (columnName) {
							record[columnName] = item[columnName] || '';
						});
						return record;
					});

					return formatter(records, null, pageIndex);
				}

				function getRecordsFromBody(body) {
					if (body.response[serviceKey]) {
						return body.response[serviceKey];
					} else if (body.response[service.url]) {
						return body.response[service.url];
					}
				}

				if (program.meta) {
					return renderMetaData(service.url);
				}

				if (program.rendererName === 'table') {
					program.wrapWithInteractivePaging(opts, function pageHandler(res, body, nextPage) {
						var records;
						pageIndex += 1;

						if (program.api.hasRecord(body)) {
							records = getRecordsFromBody(body);
							var formatted = renderWithFormatter(records, program.formatter, pageIndex);
							var longestLine = formatted.split('\n').map(function (line) { return line.replace(/\033\[\d+m/g, '').length; }).reduce(function(longest, current) {
								return (current > longest) ? current : longest;
							}, 0);

							if ((program.less && process.stdout.columns) && longestLine > process.stdout.columns) {
								editor.pipeToLess(formatted, function () {
									nextPage();
								});
							} else {
								process.stdout.write(renderWithFormatter(records, program.formatter, pageIndex));
								nextPage();
							}
						} else {
							console.log('No %s records found', service.singular.yellow);
						}
					});
				} else {
					var formatted = '';
					program.wrapWithInteractivePaging(opts, function pageHandler(res, body, nextPage) {
						var records;
						var pageCount;
						pageIndex += 1;

						if (program.api.hasRecord(body)) {
							pageCount = Math.ceil(body.response.count / body.response.num_elements);
							program.spinner.setStatus('Page %s of %s ', pageIndex.toString().cyan, pageCount.toString().cyan);
							records = getRecordsFromBody(body);
							formatted += renderWithFormatter(records, program.formatter, pageIndex);
						}
						nextPage();
					}, function pagingDone() {
						program.render(formatted, program.formatterName);
					});
				}
			});
	});

};
