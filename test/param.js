/* global require, describe, it, assert, beforeEach */

var assert = require('assert');
var Param = require('../lib/getopt-long-param.js');

var test_data = [
    {
        'name': 'Simple parameter',
        'args': ['long|l', { description: 'A long named option' }],
        'this': [
            [ 'name'       , 'long'                ],
            [ 'possible'   , [ 'long', 'l' ]       ],
            [ 'description', 'A long named option' ],
            [ 'short'      , [ 'l' ]               ]
        ],
        'data': [
            { arg: '--test', match: 0, value: null },
            { arg: '--long', match: 1, value: true },
            { arg: '-l'    , match: 1, value: true },
            { arg: '--log' , match: 0, value: null }
        ]
    },
    {
        'name': 'Simple parameter with more options',
        'args': ['long|my-long|l', { description: 'A long named option' }],
        'this': [
            [ 'name',        'long'                     ],
            [ 'possible',    [ 'long', 'my-long', 'l' ] ],
            [ 'description', 'A long named option'      ],
            [ 'short',       [ 'l' ]                    ]
        ],
        'data': [
            { arg: '--test'   , match: 0, value: null },
            { arg: '--long'   , match: 1, value: true },
            { arg: '--my-long', match: 1, value: true },
            { arg: '-l'       , match: 1, value: true },
            { arg: '--log'    , match: 0, value: null }
        ]
    },
    {
        'name': 'Simple negatable parameter',
        'args': ['long|l!', { description: 'A long negatable named option' }],
        'this': [
            [ 'name',      'long'          ],
            [ 'negatable', true            ],
            [ 'possible',  [ 'long', 'l' ] ],
            [ 'short',     [ 'l' ]         ]
        ],
        'data': [
            { arg: '--test'   , match: 0, value: null  },
            { arg: '--no-long', match: 1, value: false },
            { arg: '--long'   , match: 1, value: true  },
            { arg: '-l'       , match: 1, value: true  },
            { arg: '--log'    , match: 0, value: null  }
        ]
    },
    {
        'name': 'Simple incrementer parameter',
        'args': ['long|l+', { description: 'A long negatable named option' }],
        'this': [
            [ 'name',      'long'          ],
            [ 'increment', true            ],
            [ 'possible',  [ 'long', 'l' ] ],
            [ 'short',     [ 'l' ]         ]
        ],
        'data': [
            { arg: '--long'    , match: 1, value: 1    },
            { arg: ['-l', '-l'], match: 2, value: 2    },
            { arg: '-ll'       , match: 0, value: 2    },
            { arg: '--log'     , match: 0, value: null }
        ]
    },
    {
        'name': 'Simple parameter with an argument ',
        'args': ['long|l=', { description: 'A long option with an argument' }],
        'this': [
            [ 'name',      'long'          ],
            [ 'parameter', true            ],
            [ 'possible',  [ 'long', 'l' ] ],
            [ 'short',     [ 'l' ]         ]
        ],
        'data': [
            { arg: '--long=val', match: 1, value: 'val'  },
            { arg: '-l'        , match: 0, value: null, error: '--long requires a value\n' }
        ]
    },
    {
        'name': 'Simple parameter with an argument ',
        'args': ['long|l=s', { description: 'A long option with a string argument' }],
        'this': [
            [ 'name',      'long'          ],
            [ 'parameter', true            ],
            [ 'possible',  [ 'long', 'l' ] ],
            [ 'short',     [ 'l' ]         ]
        ],
        'data': [
            { arg: '--long=val', match: 1, value: 'val'  },
            { arg: '-l'        , match: 0, value: null, error: '--long requires a value\n' }
        ]
    },
    {
        'name': 'Simple parameter with an int argument ',
        'args': ['long|l=i', { description: 'A long option with an integer' }],
        'this': [
            [ 'name',      'long'          ],
            [ 'parameter', true            ],
            [ 'possible',  [ 'long', 'l' ] ],
            [ 'short',     [ 'l' ]         ]
        ],
        'data': [
            { arg: '--long=val', match: 0, value: null, error: '--long must be an integer\n' },
            { arg: '--long=7'  , match: 1, value: 7    },
            { arg: '--long=0'  , match: 1, value: 0    },
            { arg: '-l'        , match: 0, value: null, error: '--long requires a value\n' }
        ]
    },
    {
        'name': 'Simple parameter with an float argument ',
        'args': ['long|l=f', { description: 'A long option with an float' }],
        'this': [
            [ 'name',      'long'          ],
            [ 'parameter', true            ],
            [ 'possible',  [ 'long', 'l' ] ],
            [ 'short',     [ 'l' ]         ]
        ],
        'data': [
            { arg: '--long=val'   , match: 0, value: null, error: '--long must be an number\n' },
            { arg: '--long=7.1'   , match: 1, value: 7.1  },
            { arg: '--long=0'     , match: 1, value: 0    },
            { arg: ['--long', '0'], match: 2, value: 0    },
            { arg: '-l'           , match: 0, value: null, error: '--long requires a value\n' }
        ]
    },
    {
        'name': 'Simple parameter with an int argument ',
        'args': [
            'long|l=i',
            {
                description: 'A long option with an integer',
                test: function(val) { if (val < 0) throw '--long must be a positive integer\n'; return val; }
            }
        ],
        'this': [
            ['name', 'long'],
        ],
        'data': [
            { arg: '--long=val', match: 0, value: null, error: '--long must be an integer\n' },
            { arg: '--long=7'  , match: 1, value: 7    },
            { arg: '--long=-7' , match: false, value: null, error: '--long must be a positive integer\n' },
            { arg: '-l'        , match: 0, value: null, error: '--long requires a value\n' }
        ]
    },
    {
        'name': 'Parameter with lots of ints',
        'args': ['long|l=i@', { description: 'A long option with integers' }],
        'this': [
            [ 'name',      'long'          ],
            [ 'parameter', true            ],
            [ 'possible',  [ 'long', 'l' ] ],
            [ 'short',     [ 'l' ]         ],
            [ 'value',     [     ]         ]
        ],
        'data': [
            { arg: '--long=val'                 , match: 0, value: null, error: '--long must be an integer\n' },
            { arg: '--long=7'                   , match: 1, value: [7]    },
            { arg: '--long=0'                   , match: 1, value: [0]    },
            { arg: ['--long=0'  , '--long=1']   , match: 2, value: [0,1]  },
            { arg: ['--long','9', '--long','-1'], match: 4, value: [9,-1] },
            { arg: '-l4'                        , match: 1, value: [4]    },
            { arg: '-l'                         , match: 0, value: null, error: '--long requires a value\n' }
        ]
    },
    {
        'name': 'Parameter with named ints',
        'args': ['long|l=i%', { description: 'A long option named integers' }],
        'this': [
            [ 'name'     , 'long'          ],
            [ 'parameter', true            ],
            [ 'object'   , true            ],
            [ 'possible' , [ 'long', 'l' ] ],
            [ 'short'    , [ 'l' ]         ],
            [ 'value'    , {     }         ]
        ],
        'data': [
            { arg: '--long=val'                              , match: 0, value: null, error: '--long must be an integer\n' },
            { arg: '--long=val=7'                            , match: 1, value: {val: 7}   },
            { arg: '--long=val=0'                            , match: 1, value: {val: 0}   },
            { arg: ['--long=first=0'  , '--long=second=1'   ], match: 2, value: {first: 0, second: 1} },
            { arg: ['--long','first=9', '--long','second=-1'], match: 4, value: {first: 9, second:-1} },
            { arg: '-l'                                      , match: 0, value: null, error: '--long requires a value\n' }
        ]
    }
];

for ( var i in test_data ) {
    (function(data) {
        describe(data.name, function() {

            if (data['this']) {
                for (var j in data['this']) {
                    (function(test) {
                        it('sets ' + test[0], function() {
                            var param, error;
                            try {
                                param = new Param.param(data.args);
                                error = false;
                            }
                            catch (e) {
                                error = e;
                            }
                            assert(!error, 'No error creating new parameter');
                            assert.deepEqual(param[test[0]], test[1], test[2]);
                        });
                    })(data['this'][j]);
                }
            }

            for (var k in data.data) {
                (function(test) {
                    var call = '"' + ( test.arg instanceof Array ? test.arg.join(' ') : test.arg ) + '"';
                    it('with parameter ' + call, function() {
                          var param, match, error;
                          try {
                              param = new Param.param(data.args);
                              if (!(test.arg instanceof Array)) {
                                  test.arg = [test.arg];
                              }

                              match = 0;
                              while (test.arg.length) {
                                  var nextMatch = param.process.apply(param, test.arg);
                                  if (nextMatch < 0) {
                                      test.arg[0] = test.arg[0].replace(/^-./, '-');
                                  }
                                  else {
                                      test.arg.shift();
                                  }
                                  match = match + nextMatch;
                              }

                              error = false;
                          }
                          catch (e) {
                              error = e;
                          }
                          if (!test.error) {
                              if (match != test.match || error) {
                                  console.log('Expect no errors\n', {
                                      param: param,
                                      error: error,
                                      match: match,
                                      test : test
                                  });
                              }
                              assert(!error, 'No error creating new parameter');
                              assert.equal(test.match, match, 'Check that ' + call + ' sets match to ' + test.match + ' (actual = ' + match);
                              if ( typeof param.value === 'object' ) {
                                  assert.deepEqual(test.value, param.value, 'Check that ' + call + ' set value to ' + test.value);
                              }
                              else {
                                  assert.equal(test.value, param.value, 'Check that ' + call + ' set value to ' + test.value);
                              }
                          }
                          else {
                              if (test.error !== error) {
                                  console.log('Expect errors\n', {
                                      param: param,
                                      error: error,
                                      test : test
                                  });
                              }
                              assert.equal(test.error, error, 'Check that ' + call + ' throws and error');
                          }
                    });
                })(data.data[k]);
            }

        });
    })(test_data[i]);
}
