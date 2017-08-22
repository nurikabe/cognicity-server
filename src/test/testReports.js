/**
 * testReports module
 * @module test/testReports
 * A module to test the /reports endpoint
 */

import * as test from 'unit.js';

/**
 * Test reports endpoint
 * @function testReports
 * @param {Object} app - CogniCity server app object
 * @param {Number} reportid - CogniCity report ID to test against
 * @param {String} createdAt - Sample timestamp in ISO 8601 format
 */
export default function(app, reportid, createdAt) {
  // Reports endpoint
  describe('Reports endpoint', function() {
    // Can get reports
    it('Get all reports (GET /reports)', function(done) {
        test.httpAgent(app)
          .get('/reports')
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) {
              test.fail(err.message + ' ' + JSON.stringify(res));
            } else {
              done();
            }
         });
      });

    // Can get reports as geojson
    it('Get all reports as geojson', function(done) {
        test.httpAgent(app)
          .get('/reports?format=json&geoformat=geojson')
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) {
              test.fail(err.message + ' ' + JSON.stringify(res));
            } else {
              done();
            }
         });
      });

    // Can get reports as geojson
    it('Get all reports as topojson', function(done) {
        test.httpAgent(app)
          .get('/reports?format=json&geoformat=topojson')
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) {
              test.fail(err.message + ' ' + JSON.stringify(res));
            } else {
              done();
            }
         });
      });

    // Can get reports by city
    it('Get reports by city /reports?city=jbd', function(done) {
        test.httpAgent(app)
          .get('/reports?city=jbd')
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) {
              test.fail(err.message + ' ' + JSON.stringify(res));
            } else {
              done();
            }
         });
      });

    // Catch report by city error
    it('Get reports by city /reports?city=xxx', function(done) {
        test.httpAgent(app)
          .get('/reports?city=xxx')
          .expect(400)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) {
              test.fail(err.message + ' ' + JSON.stringify(res));
            } else {
              done();
            }
         });
      });

      // Can report by id
      it('Get reports/:id endpoint', function(done) {
          test.httpAgent(app)
            .get('/reports/'+reportid+'?format=json&geoformat=geojson')
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
              if (err) {
                test.fail(err.message + ' ' + JSON.stringify(res));
              } else {
                test.value(res.body.result.features[0].properties.pkey)
                  .is(reportid);
                test.value(res.body.result.features[0].properties.source)
                  .is('grasp');
                test.value(res.body.result.features[0].properties.created_at)
                  .is(createdAt);
                test.value(res.body.result.features[0].properties.status)
                  .is('confirmed');
                test.value(res.body.result.features[0].properties.image_url)
                  .is('https://images.petabencana.id/dummy_image_url');
                test.value(res.body.result.features[0].properties.disaster_type)
                  .is('flood');
                test.value(res.body.result.features[0].properties.report_data
                  .flood_depth).is(20);
                done();
              }
           });
        });
   });
}
