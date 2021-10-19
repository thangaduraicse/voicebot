'use strict';

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
            bucket: s3BucketName,
            key: key + '.mp3',
            url: url
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
