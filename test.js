var assert = require('assert'),
    ondone = require('./index.js');

describe('tests', function() {

  it('should call the done function once all tasks complete', function(done) {
    var tasks = ondone([
        function(done) { done(); },
        function(done) { done(); }
      ], function() {
        done();
      });

    tasks.map(function(t) { t(function() {}); });
  });

  it('should call the done function if any of the tasks returns an error', function(done) {
    var tasks = ondone([
        function(done) { done(new Error('Expected')); },
        function(done) { done(); }
      ], function(err) {
        assert.ok(err);
        assert.equal(err.message, 'Expected');
        done();
      });

    tasks.map(function(t) { t(function() {}); });
  });

  it('if any task returns an err, all the other tasks are skipped', function(done) {
    var calls = [],
        tasks = ondone([
        function(done) { calls.push(1); done(); },
        function(done) { calls.push(2); done(new Error('Expected')); },
        function(done) { calls.push(3); done(); },
        function(done) { calls.push(4); done(); }
      ], function(err) {
        assert.ok(err);
        assert.equal(err.message, 'Expected');
        // wait a single timeout just to be sure
        setTimeout(function() {
          assert.deepEqual(calls, [ 1, 2 ]);
          done();
        }, 15);
      });

    tasks.map(function(t) { t(function() {}); });
  });

  it('calling done multiple times throws', function(done) {
    var tasks = ondone(function(done) { done(); done(); }, done);
    assert.throws(function() {
      tasks.map(function(t) { t(function() {}); });
    }, function(err) {
      return err.message == '"done" callback called more than once!';
    });
  });

  it('tasks may receive additional args as long as the last arg is a doneFn', function(done) {
    var calls = [],
        tasks = ondone([
        function(arg1, arg2, done) { calls.push([arg1, arg2]); done(); },
        function(arg1, arg2, done) { calls.push([arg1, arg2]); done(); },
      ], function() {
        assert.deepEqual(calls, [ ['a', 'b'], ['c', 'd'] ]);
        done();
      });

    var inputs = [ ['a', 'b'], ['c', 'd'] ];
    tasks.map(function(t, index) {
      t.apply(this, inputs[index].concat(function() {}));
    });
  });

  it('tasks may be an empty array', function(done) {
    ondone([], done);
  });

  it('tasks may be a single function', function(done) {
    var tasks = ondone(function(done) { done(); }, done);
    tasks.map(function(t) { t(function() {}); });
  });

  it('tasks may be falsey', function(done) {
    ondone(null, done);
  });

  it('tasks may be passed as arguments, one task', function(done) {
    var tasks = ondone(
        function(done) { done(); }, function() {
        done();
      });

    tasks.map(function(t) { t(function() {}); });
  });

  it('tasks may be passed as arguments, three tasks', function(done) {
    var tasks = ondone(
        function(done) { done(); },
        function(done) { done(); },
        function(done) { done(); },
        function() {
        done();
      });

    tasks.map(function(t) { t(function() {}); });
  });

  it('tasks may return additional results as long as the first arg is err', function(done) {
    var results = [],
    tasks = ondone([
      function(done) { done(null, 'a'); },
      function(done) { done(null, 'b', 'c'); },
      function(done) { done(); }
    ], function() {
      assert.deepEqual(results, ['a', 'b', 'c']);
      done();
    });
    tasks.map(function(t) {
      t(function(err) {
        if (arguments.length > 1) {
          results = results.concat(Array.prototype.slice.call(arguments, 1));
        }
      });
    });

  });

});
