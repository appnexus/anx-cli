describe('templates', function() {
	describe('GET', function() {
		it('should have known schema', function(done) {
			api.getJson('template', function(err, res, body) {
				assertResponse(err, body);

				var expectedSchema = isArrayWithElements([{
					id: isInteger,
					name: isString,
					description: isNullableString,
					last_modified: isDateString,
					is_archived: isBoolean,
					member_id: isNullableInteger,
					track_on_callback: isBoolean,
					is_default: isBoolean,
					content_html: isNullableString,
					content_js: isNullableString,
					content_xml: isNullableString,
					callback_content_html: isNullableString,
					media_subtype: {
						id: isInteger,
						name: isString,
						media_type_name: isString,
						media_type_id: isInteger
					},
					format: {
						id: isInteger,
						name: isString
					},
					macros: isNullable([{
						code: isString,
						name: isString,
						is_required: isBoolean,
						type: isString,
						default_value: isNullableString,
						other_data: isNullableString
					}])
				}]);

				assertSchema(body.response['templates'], expectedSchema, 'templates');
				done();
			});
		});
	});
});
