// var _ = require('lodash');
// var fs = require('fs');
// var assert = require('assert');
// var helper = require('./lib/api_helper.js');

// var _api;
// var TEST_MEMBER_ID = 4209;

// function describeMeta(serviceName) {
// 	describe('META', function () {
// 		it('should report known schema', function (done) {
// 			api.getJson(serviceName + '/meta?member_id=' + TEST_MEMBER_ID, function (err, res, body) {
// 				assertResponse(err, body);

// 				var metaJson = require('./responses/' + serviceName + '-meta.json');

// 				assert.deepEqual(body.response.fields, metaJson);
// 				done();
// 			});
// 		});
// 	});
// }

// // Generate META json example:
// // anx mediated-bids --meta --json > test/responses/mediated-bid-meta.json

// describe('API Integration', function () {
// 	this.timeout(8000);
// 	var session;
// 	var newNetworkId;
// 	var newAdvertiserId;
// 	var newBidId;
// 	var networkName = 'Integration Test TEST' + new Date().getTime();

// 	before(function (done) {
// 		assert(fs.existsSync(process.env.HOME + '/.anx-session'), 'Missing Session, Please run anx login');
// 		session = JSON.parse(fs.readFileSync(process.env.HOME + '/.anx-session', 'utf8') || {});
// 		assert.notDeepEqual(session, {});
// 		assert(session.target);
// 		console.log('Testing API: %s\n', session.target);

// 		var _api = require('../')({
// 			target: session.target || 'https://hb.sand-08.adnxs.net/',
// 			token: session.targets[session.target].token
// 		});
// 		// _api.login(process.env.ANX_USERNAME, process.env.ANX_PASSWORD, function (err, token) {
// 		// 	done();
// 		// });
// 		done();
// 	});

// 	describe('Can Run Tests', function () {
// 		it('Session Exists', function () {
// 			assert.notDeepEqual(session, {});
// 		});

// 		it('Target is set', function () {
// 			assert(session.target !== undefined, 'Target not set, use: anx target [sand url]');
// 		});

// 		it('Valid login', function () {
// 			assert(session.targets[session.target].token !== undefined, 'Not logged in, use: anx login [username]');
// 		});
// 	})

// 	describe('creative-custom-request-partner service', function () {
// 		describeMeta('creative-custom-request-partner');

// 		describe('GET', function () {
// 			it('should have known schema', function (done) {
// 				api.getJson('creative-custom-request-partner?sort=id.desc', function (err, res, body) {
// 					assertResponse(err, body);

// 					var expectedSchema = isArrayWithElements([
// 						{
// 							macro_type: inList('standard', 'customsdk'), // NEW
// 							id: isInteger,
// 							member_id: isNullableInteger,
// 							name: isString,
// 							last_modified: isDateString,
// 							creative_custom_request_partner_credentials: isNullable(isArray([{
// 								creative_custom_request_partner_id: isInteger,
// 								id: isInteger,
// 								is_required: isBoolean,
// 								is_obscured: isBoolean,
// 								last_modified: isDateString,
// 								name: isString,
// 								type: inList('string')
// 							}])),
// 							creative_custom_request_partner_integration: isNullable(isObject({
// 								active: isBoolean,
// 								data_timezone: inList('EST', 'GMT'),
// 								supported: isBoolean,
// 								creative_custom_request_partner_id: isInteger,
// 								data_granularity: inList('hourly', 'daily'),
// 								id: isInteger,
// 								last_modified: isDateString
// 							})),
// 							creative_custom_request_templates: isNullable(isArray([{
// 								type_id: inList(2, 3, 4, 5, 6, 9), // NEW
// 								hostname: isNullableString, // NEW
// 								port: isInteger, // NEW
// 								is_client: isBoolean, // NEW
// 								content: isNullableString,
// 								creative_custom_request_partner_id: isInteger,
// 								id: isInteger,
// 								is_post: isBoolean,
// 								last_modified: isDateString,
// 								macros: isNullable([{
// 									code: isString,
// 									id: isInteger,
// 									is_required: isBoolean,
// 									last_modified: isDateString,
// 									name: isString,
// 									template_id: isInteger,
// 									type: 'string'
// 								}]),
// 								member_id: isInteger,
// 								name: isNullableString, // Null???
// 								timeout_ms: isInteger,
// 								uri: isNullableString
// 							}]))

// 						}
// 					]);

// 					assertSchema(body.response['creative-custom-request-partners'], expectedSchema, 'creative-custom-request-partners');
// 					done();
// 				});
// 			});
// 		});
// 	});

// 	describe('Mediated Networks Service', function () {
// 		describeMeta('mediated-network');

// 		describe('GET', function () {
// 			it('should have known schema', function (done) {
// 				api.getJson('mediated-network', function (err, res, body) {
// 					assertResponse(err, body);

// 					var expectedSchema = isArrayWithElements([
// 						{
// 							member_id: isInteger, // NEW
// 							active: isBoolean, // NEW
// 							processed_on: isDateString, // NEW
// 							last_modified: isDateString, // NEW
// 							bid_count: isInteger,
// 							id: isInteger,
// 							advertiser_id: isInteger,
// 							bid_count: isInteger,
// 							name: isString,
// 							network_type: inList('mobile'),
// 							credentials: isNullableString,
// 							is_data_integration_active: isBoolean,
// 							creative_custom_request_partner_id: isInteger
// 						}
// 					]);

// 					assertSchema(body.response['mediated-networks'], expectedSchema, 'mediated-networks');
// 					done();
// 				});
// 			});
// 		});

// 		describe('POST', function () {

// 			it('should allow post', function (done) {

// 				var record = {
// 					name: 'Integration Test ' + new Date().getTime(),
// 					credentials: null,
// 					active: false,
// 					creative_custom_request_partner_id: 1,
// 					is_data_integration_active: true,
// 					network_type: 'mobile'
// 				};
// 				api.postJson('mediated-network?member_id=' + TEST_MEMBER_ID, { 'mediated-network': record }, function (err, res, body) {
// 					assertResponse(err, body);

// 					var expectedSchema = {
// 						id: isInteger,
// 						name: record.name,
// 						credentials: null,
// 						advertiser_id: isInteger,
// 						member_id: TEST_MEMBER_ID,
// 						bid_count: isInteger,
// 						active: record.active,
// 						bid_count: 0,
// 						is_data_integration_active: record.is_data_integration_active,
// 						creative_custom_request_partner_id: 1,
// 						processed_on: isDateString,
// 						last_modified: isDateString,
// 						network_type: 'mobile'
// 					};

// 					newNetworkId = body.response['mediated-network'].id;
// 					newAdvertiserId = body.response['mediated-network'].advertiser_id;

// 					assertSchema(body.response['mediated-network'], expectedSchema, 'mediated-network');

// 					// Make sure the advertiser is_mediated === true
// 					api.getJson('advertiser?id=' + newAdvertiserId, function (err, res, body) {
// 						assertResponse(err, body);

// 						var expectedSchema = isObject({
// 							id: newAdvertiserId,
// 							is_mediated: true
// 						}, { ignoreUnexpected: true });

// 						assertSchema(body.response['advertiser'], expectedSchema, 'mediated-network advertiser [is_mediated]');
// 					});

// 					done();
// 				});
// 			});
// 		});

// 		describe('PUT', function () {
// 			it('should allow updating', function (done) {

// 				var record = {
// 					id: newNetworkId,
// 					name: networkName,
// 					active: true,
// 					is_data_integration_active: false,
// 					credentials: "{ 'test credential subobject': 'password' }"
// 				};

// 				api.putJson('mediated-network?member_id=' + TEST_MEMBER_ID, { 'mediated-network': record }, function (err, res, body) {
// 					assertResponse(err, body);

// 					var expectedSchema = {
// 						id: isInteger,
// 						name: record.name,
// 						credentials: isString,
// 						advertiser_id: isInteger,
// 						member_id: TEST_MEMBER_ID,
// 						active: record.active,
// 						bid_count: 0,
// 						is_data_integration_active: record.is_data_integration_active,
// 						creative_custom_request_partner_id: 1,
// 						processed_on: isDateString,
// 						last_modified: isDateString,
// 						network_type: inList('mobile')
// 					};

// 					assertSchema(body.response['mediated-network'], expectedSchema, 'mediated-network');
// 					done();
// 				});
// 			});

// 			it('should allow saving with the same name', function (done) {

// 				var record = {
// 					id: newNetworkId,
// 					name: networkName
// 				};

// 				api.putJson('mediated-network?member_id=' + TEST_MEMBER_ID, { 'mediated-network': record }, function (err, res, body) {
// 					assertResponse(err, body);
// 					done();
// 				});
// 			});
// 		});

// 	});

// 	describe('Mediated Bids Service', function () {
// 		describeMeta('mediated-bid');

// 		describe('GET', function () {
// 			it('should have known schema', function (done) {
// 				api.getJson('mediated-bid?member_id=' + TEST_MEMBER_ID, function (err, res, body) {
// 					assertResponse(err, body);

// 					var expectedSchema = isArrayWithElements([
// 						{
// 							id: isInteger,
// 							type: isString,
// 							name: isString,
// 							active: isBoolean,
// 							member_id: isInteger,
// 							line_item_id: isInteger,
// 							campaign_id: isInteger,
// 							creative_id: isInteger,
// 							profile_id: isInteger,
// 							last_modified: isDateString,
// 							mediated_network: {
// 								id: isInteger,
// 								name: isString,
// 								active: isBoolean,
// 								advertiser_id: isInteger,
// 								creative_custom_request_partner_id: isInteger
// 							},
// 							campaign: isObject({
// 								id: isInteger
// 							}, { ignoreUnexpected: true }),
// 							'line-item': isObject({
// 								id: isInteger,
// 								code: null,
// 								name: isNullableString,
// 								revenue_value: isNumber,
// 								advertiser_id: isInteger,
// 								state: inList('active', 'inactive'),
// 								last_modified: isDateString,
// 								profile_id: null,
// 								member_id: TEST_MEMBER_ID,
// 								advertiser: {
// 									id: isInteger,
// 									name: isString
// 								},
// 								campaigns: [isObject({
// 									id: isInteger
// 								}, { ignoreUnexpected: true })]
// 							}, { ignoreUnexpected: true }),
// 							profile: isObject({
// 								id: isInteger
// 							}, { ignoreUnexpected: true }),
// 							creative: isObject({
// 								id: isInteger,
// 								name: isNullableString,
// 								brand_id: isInteger,
// 								width: isInteger,
// 								height: isInteger,
// 								macros: null,
// 								profile_id: null,
// 								code: null,
// 								code2: null,
// 								member_id: isInteger,
// 								advertiser_id: isInteger,
// 								publisher_id: null,
// 								state: 'active',
// 								last_modified: isDateString,
// 								media_subtypes: [inList('banner')],
// 								custom_request_template: {
// 									id: isString,
// 									timeout_ms: isString,
// 									last_modified: isDateString
// 								},
// 								brand: {
// 									id: isInteger,
// 									name: isString,
// 									category_id: isInteger
// 								},
// 								template: {
// 									id: isInteger,
// 									name: 'Standard',
// 									media_subtype_id: isInteger,
// 									format_id: isInteger
// 								},
// 								custom_macros: isNullable([{
// 									code: isString,
// 									value: isString
// 								}]),
// 								mobile: null
// 							}, { ignoreUnexpected: true })
// 						}
// 					]);

// 					assertSchema(body.response['mediated-bids'], expectedSchema, 'mediated-bids');
// 					done();
// 				});
// 			});
// 		});

// 		// member id must be in the url
// 		// meta requires member id
// 		describe('POST', function () {
// 			it('should allow post', function (done) {

// 				var record = {
// 					"name": 'TEST RECORD MOCHA' + new Date().getTime(),
// 					"mediated_network_id": newNetworkId,
// 					active: false,
// 					"creative": {
// 						"custom_request_template": {
// 							"id": 1 // creative_custom_request_template_id
// 						},
// 						"template": {
// 							"id": 4
// 						},
// 						"width": 300,
// 						"height": 250,
// 						"custom_macros": [{
// 							"code": "MK_SITEID",
// 							"value": "test1"
// 						}]
// 					},
// 					"type": "test"
// 				};

// 				api.postJson('mediated-bid?member_id=' + TEST_MEMBER_ID + '&advertiser_id=' + newAdvertiserId, { 'mediated-bid': record }, function (err, res, body) {
// 					assertResponse(err, body);

// 					var expectedSchema = {
// 						id: isInteger,
// 						type: isString,
// 						name: isString,
// 						member_id: TEST_MEMBER_ID,
// 						active: false,
// 						line_item_id: isInteger,
// 						campaign_id: isInteger,
// 						creative_id: isInteger,
// 						profile_id: isInteger,
// 						last_modified: isDateString,
// 						mediated_network: {
// 							id: isInteger,
// 							name: isString,
// 							active: isBoolean,
// 							advertiser_id: isInteger,
// 							creative_custom_request_partner_id: isInteger
// 						},
// 						campaign: isObject({
// 							id: isInteger
// 						}, { ignoreUnexpected: true }),
// 						'line-item': isObject({
// 							id: isInteger
// 						}, { ignoreUnexpected: true }),
// 						profile: isObject({
// 							id: isInteger
// 						}, { ignoreUnexpected: true }),
// 						creative: isObject({
// 							id: isInteger
// 						}, { ignoreUnexpected: true })
// 					};

// 					newBidId = body.response['mediated-bid'].id;

// 					assertSchema(body.response['mediated-bid'], expectedSchema, 'mediated-bid');
// 					done();
// 				});
// 			});
// 		});

// 		describe('PUT', function () {
// 			it('should allow updating', function (done) {

// 				var record = {
// 					id: newBidId,
// 					active: true,
// 					"name": "New NAME",
// 					"creative": {
// 						"template": {
// 							"id": 2
// 						},
// 						"width": 600,
// 						"height": 400,
// 						"custom_macros": [{
// 							"code": "MK_SITEID",
// 							"value": "test1"
// 						}]
// 					}
// 				};

// 				api.putJson('mediated-bid?member_id=' + TEST_MEMBER_ID, { 'mediated-bid': record }, function (err, res, body) {
// 					assertResponse(err, body);

// 					var expectedSchema = {
// 						id: isInteger,
// 						type: isString,
// 						name: record.name,
// 						active: true,
// 						member_id: TEST_MEMBER_ID,
// 						line_item_id: isInteger,
// 						campaign_id: isInteger,
// 						creative_id: isInteger,
// 						profile_id: isInteger,
// 						last_modified: isDateString,
// 						mediated_network: {
// 							id: isInteger,
// 							name: isString,
// 							active: isBoolean,
// 							advertiser_id: isInteger,
// 							creative_custom_request_partner_id: isInteger
// 						},
// 						campaign: isObject({
// 							id: isInteger
// 						}, { ignoreUnexpected: true }),
// 						'line-item': isObject({
// 							id: isInteger
// 						}, { ignoreUnexpected: true }),
// 						profile: isObject({
// 							id: isInteger
// 						}, { ignoreUnexpected: true }),
// 						creative: isObject({
// 							id: isInteger,
// 							template: isObject({
// 								id: record.creative.template.id
// 							}, { ignoreUnexpected: true }),
// 							width: record.creative.width,
// 							height: record.creative.height
// 						}, { ignoreUnexpected: true })
// 					};

// 					assertSchema(body.response['mediated-bid'], expectedSchema, 'mediated-bid');
// 					done();
// 				});
// 			});
// 		});

// 	});

// 	describe('Final CLEANUP', function () {
// 		describe('Deactivate Network', function () {
// 			it('should deactivate bids', function (done) {

// 				// Verify the bid is active
// 				api.getJson('mediated-bid?member_id=' + TEST_MEMBER_ID + '&id=' + newBidId, function (err, res, body) {
// 					assertResponse(err, body);

// 					// Verify the bid is inactive
// 					var expectedSchema = isObject({
// 						id: newBidId,
// 						active: true
// 					}, { ignoreUnexpected: true });

// 					api.getJson('mediated-network?id=' + newNetworkId, function (err, res, body) {

// 						// Verify the network is active
// 						var expectedSchema = isObject({
// 							id: newNetworkId,
// 							active: true,
// 							bid_count: 1
// 						}, { ignoreUnexpected: true });

// 						assertSchema(body.response['mediated-network'], expectedSchema, 'mediated-network [Active]');

// 						var record = {
// 							id: newNetworkId,
// 							active: false
// 						};

// 						api.putJson('mediated-network?member_id=' + TEST_MEMBER_ID + '&id=' + newNetworkId, { 'mediated-network': record }, function (err, res, body) {
// 							assertResponse(err, body);

// 							// Verify the network is now inactive
// 							var expectedSchema = isObject({
// 								id: newNetworkId,
// 								active: false,
// 								bid_count: 1
// 							}, { ignoreUnexpected: true });

// 							assertSchema(body.response['mediated-network'], expectedSchema, 'mediated-network [Inactive]');

// 							api.getJson('mediated-bid?member_id=' + TEST_MEMBER_ID + '&id=' + newBidId, function (err, res, body) {
// 								assertResponse(err, body);

// 								// Verify the bid is inactive
// 								var expectedSchema = isObject({
// 									id: newBidId,
// 									active: false
// 								}, { ignoreUnexpected: true });

// 								assertSchema(body.response['mediated-bid'], expectedSchema, 'mediated-bid');
// 								done();
// 							});
// 						});
// 					});
// 				});
// 			});

// 			it('should allow saving with the same name', function (done) {

// 				var record = {
// 					id: newNetworkId,
// 					name: networkName
// 				};

// 				api.putJson('mediated-network?member_id=' + TEST_MEMBER_ID, { 'mediated-network': record }, function (err, res, body) {
// 					assertResponse(err, body);
// 					done();
// 				});
// 			});
// 		});

// 		describe('Mediated Bid Service DELETE', function () {
// 			it('should allow delete', function (done) {
// 				// NOTE: member_id & advertiser_id is required in the url
// 				api.deleteJson('mediated-bid?member_id=' + TEST_MEMBER_ID + '&advertiser_id=' + newAdvertiserId + '&id=' + newBidId, function (err, res, body) {
// 					assertResponse(err, body);

// 					assert.equal(body.response.count, 1, 'invalid record count')
// 					done();
// 				});
// 			});
// 		});

// 		describe('Mediated Networks Service DELETE', function () {
// 			it('should allow delete', function (done) {
// 				api.deleteJson('mediated-network?id=' + newNetworkId, function (err, res, body) {
// 					assertResponse(err, body);

// 					assert.equal(body.response.count, 1, 'invalid record count')
// 					done();
// 				});
// 			});
// 		});
// 	});

// });
