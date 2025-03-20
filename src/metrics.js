const config = require( './config' ).metrics;
const os = require( 'os' );
const pidusage = require('pidusage');

let gets = 0; let puts = 0; let posts = 0; let deletes = 0;
let activeUsers = 0; let validLoginAttempts = 0; let invalidLoginAttempts = 0;
let pizzasSold = 0; let pizzaCreationFailures = 0;
let revenue = 0;

function requestTracker( request, response, next ) {
    recordRequestType( request );
    recordLoginAttempts( request, response );
    recordPizzaPurchases( request, response );
    recordLatency( request, response );
    next();
}

function recordLatency( request, response ) {
  const startTime = Date.now();
  response.on( 'finish', () => {
    const timeDif = Date.now() - startTime;
    sendMetric( makeMetric( "Latency", timeDif, 'sum', '1' ) );
    if ( request.url === '/' && request.method === "POST" ) {
      sendMetric( makeMetric( "Pizza Creation Latency", timeDif, 'sum', '1' ) );
    }
  } );
}

function recordPizzaPurchases( request, response ) {
  if ( request.url === '/api/order' && request.method === 'POST' ) {
    const amount = request.body.items.length;
    pizzasSold += amount;
    sendMetric( makeMetric( "Pizzas Sold", pizzasSold, 'sum', '1' ) );

    response.on( 'finish', () => {
      if ( response.statusCode != 200 ) {
        pizzaCreationFailures += amount;
        sendMetric( makeMetric( "Pizza Creation Failures", pizzaCreationFailures, 'sum', '1' ) );
      } else {
        request.body.items.forEach( (item) => {
          revenue += item.price;
        });
        sendMetric( makeFloatMetric( "Current Revenue", revenue, 'sum', '1' ) );
      }
    } );
  }
}

function recordLoginAttempts( request, response ) {
  const url = request.url;
  const method = request.method;

  if ( url === '/api/auth' && method === 'PUT' ) {
    response.on( 'finish', () => {
      if ( response.statusCode == 404 ) {
        invalidLoginAttempts++;
        sendMetric( makeMetric ( 'Invalid Logins', invalidLoginAttempts, 'sum', '1' ) );
      } else if ( response.statusCode == 200 ) {
        validLoginAttempts++;
        sendMetric( makeMetric( 'Valid Logins', validLoginAttempts, 'sum', '1' ) );
        activeUsers++;
        sendMetric( makeMetric( 'Active Users', activeUsers, 'sum', '1' ) );
      }
    } );
  } else if ( url === '/api/auth' && method === 'DELETE' ) {
    response.on( 'finish', () => {
      if ( response.statusCode == 200 ) {
        activeUsers--;
        sendMetric( makeMetric( 'Active Users', activeUsers, 'sum', '1' ) );
      }
    });
  }
}

function recordRequestType( request ) {
  const method = request.method;
    let metric;

    switch ( method ) {
        case "GET":
            gets++;
            metric = makeMetric( "GET", gets, 'sum', '1' );
            break;
        case "PUT":
            puts++;
            metric = makeMetric( "PUT", puts, 'sum', '1' );
            break;
        case "POST":
            posts++;
            metric = makeMetric( "POST", posts, 'sum', '1' );
            break;
        case "DELETE":
            deletes++;
            metric = makeMetric( "DELETE", deletes, 'sum', '1' );
            break;
    }

    sendMetric( metric );
}

function makeMetric( metricName, metricValue, type, unit ) {
    const metric = {
        resourceMetrics: [
          {
            scopeMetrics: [
              {
                metrics: [
                  {
                    name: metricName,
                    unit: unit,
                    [type]: {
                      dataPoints: [
                        {
                          asInt: metricValue,
                          timeUnixNano: Date.now() * 1000000,
                          attributes: [
                            {
                              key: "source",
                              value: { stringValue: config.source }
                            }
                          ]
                        },
                      ],
                    },
                  },
                ],
              },
            ],
          },
        ],
      };

    if (type === 'sum') {
        metric.resourceMetrics[0].scopeMetrics[0].metrics[0][type].aggregationTemporality = 'AGGREGATION_TEMPORALITY_CUMULATIVE';
        metric.resourceMetrics[0].scopeMetrics[0].metrics[0][type].isMonotonic = true;
    }
    
    return JSON.stringify( metric );
}

function makeFloatMetric( metricName, metricValue, type, unit ) {
  const metric = {
      resourceMetrics: [
        {
          scopeMetrics: [
            {
              metrics: [
                {
                  name: metricName,
                  unit: unit,
                  [type]: {
                    dataPoints: [
                      {
                        asDouble: metricValue,
                        timeUnixNano: Date.now() * 1000000,
                        attributes: [
                          {
                            key: "source",
                            value: { stringValue: config.source }
                          }
                        ]
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      ],
    };

  if (type === 'sum') {
      metric.resourceMetrics[0].scopeMetrics[0].metrics[0][type].aggregationTemporality = 'AGGREGATION_TEMPORALITY_CUMULATIVE';
      metric.resourceMetrics[0].scopeMetrics[0].metrics[0][type].isMonotonic = true;
  }
  
  return JSON.stringify( metric );
}

function sendMetric( body ){
    fetch( `${config.url}`, {
        method: 'POST',
        body: body,
        headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' }
    }).then( ( response ) => {
        if ( !response.ok ) {
            response.text().then( ( text ) => {
                console.error( `Failed to push to Grafana: ${text}\n${body}` )
            } )
        }
    } );
}

function getCpuUsagePercentage() {
  // const cpuUsage = os.loadavg()[0] / os.cpus().length;
  // return Math.round( cpuUsage  * 100);
  pidusage( process.pid, ( err, stats) => {
    if ( !err ) {
      const cpu = Math.round( stats.cpu );
      sendMetric( makeMetric( "CPU Usage", cpu, 'gauge', '%' ) );
    }
  });
}

function getMemoryUsagePercentage() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const memoryUsage = ( usedMemory / totalMemory ) * 100;
  return Math.round( memoryUsage );
}

setInterval( () => {
    const memory = getMemoryUsagePercentage();
    getCpuUsagePercentage();
    sendMetric( makeMetric( 'Memory Usage', memory, 'gauge', '%' ) );
}, 5000 );

module.exports = { requestTracker }