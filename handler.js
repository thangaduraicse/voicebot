'use strict';

const client = require('twilio')('<ACCOUNT_SID>', '<AUTH_TOKEN>');
const AWS = require('aws-sdk');
const polly = new AWS.Polly();
const s3 = new AWS.S3();
const s3BucketName = 'my-voicebot-app';

module.exports.speak = (event, _, callback) => {
  const payload = JSON.parse(event.body);
  const pollyParams = {
    OutputFormat: 'mp3',
    Text: payload.text,
    VoiceId: payload.voice,
    TextType: payload.textContentType
  };

  // Getting the audio stream for the payload.text
  polly.synthesizeSpeech(pollyParams)
    .on('success', function(response) {
      const repsonseData = response.data;
      const audioStream = repsonseData.AudioStream;
      const key = payload.dialogueHash;

      // Saving the audio stream to S3
      const s3params = {
        Bucket: s3BucketName,
        Key: key + '.mp3',
        Body: audioStream
      };

      s3.putObject(s3params)
        .on('success', function () {
          console.log('S3 Put Success!');
        })
        .on('complete', function () {
          console.log('S3 Put Complete!');
          const getS3params = {
            Bucket: s3BucketName,
            Key: key + '.mp3',
          };

          // Getting a signed URL for the saved mp3 file 
          const url = s3.getSignedUrl('getObject', getS3params);

          // Sending the result back to the user
          const result = {
            data: {
              [key]: {
                filename: key + '.mp3',
                url: url
              }
            }
          };

          callback(null, {
            statusCode: 200,
            headers: {
              'Access-Control-Allow-Origin' : '*'
            },
            body: JSON.stringify(result)
          });
        })
        .on('error', function (response) {
          console.log(response);
        })
        .send();
    })
    .on('error', function (err) {
      callback(null, {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin' : '*'
        },
        body: JSON.stringify(err)
      });
    })
    .send();
};

module.exports.getVoiceByKey = async (event, _, callback) => {
  const keys = event['multiValueQueryStringParameters']['dialogueHash'];
  const result = {
    data: {}
  };

  if (keys && keys.length) {
    for (const key of keys) {
      const s3Params = {
        Bucket: s3BucketName,
        Key: key + '.mp3',
      };

      try {
        // Throw error if file not exist
        await s3.headObject(s3Params).promise();

        // Getting a signed URL for the saved mp3 file 
        const url = await s3.getSignedUrl('getObject', s3Params);

        result.data[key] = {
          filename: key + '.mp3',
          url: url
        };
      } catch (err) {
        result.data[key] = {
          filename: key + '.mp3',
          url: null,
          errorCode: err.code
        };
      }
    }
  }

  // Sending the result back to the user
  callback(null, {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin' : '*'
    },
    body: JSON.stringify(result)
  });
};


module.exports.getPhoneNumbers = (event, _, callback) => {
  const limit = event['queryStringParameters']['limit'];
  const countryCode = event['queryStringParameters']['countryCode'];
  const areaCode = event['queryStringParameters']['areaCode'];
  
  const listParams = {
    limit: Number(limit)
  };

  if (areaCode) {
    listParams.areaCode = Number(areaCode);;
  }

  client
    .availablePhoneNumbers(countryCode)
    .local
    .list(listParams)
    .then(function async(local) {
      try {
        const pricing = await client.pricing.v1.phoneNumbers
          .countries(countryCode)
          .fetch();
        const localNumberPrices = pricing.phoneNumberPrices.find(
          (prices) => prices.number_type === 'local'
        );

        local = local.map(function(lo) {
          lo['basePrice'] = localNumberPrices.base_price;
          lo['country'] = pricing.country;
          lo['currentPrice'] = localNumberPrices.current_price;
          lo['priceUnit'] = pricing.priceUnit;

          return lo;
        });
      } catch (err) {
        console.log('Error: ', err);
      }

      callback(null, {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin' : '*'
        },
        body: JSON.stringify(local)
      });
    })
    .catch((err) => {
      callback(null, {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin' : '*'
        },
        body: JSON.stringify(err)
      });
    });  
};