describe('media-types', function() {
	describe('GET', function() {
		it('should have known schema', function(done) {
			api.getJson('media-type', function(err, res, body) {
				assertResponse(err, body);

				var expectedSchema = isArrayWithElements([{
					id: isInteger,
					name: isString,
					media_type_group_id: isNullableInteger,
					uses_sizes: inList('always', 'sometimes', 'never', null),
					last_modified: isDateString
				}]);

				assertSchema(body.response['media-types'], expectedSchema, 'media-types');
				done();
			});
		});
	});
});
