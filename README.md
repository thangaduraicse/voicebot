# Setup
1. Create serverless app called 'voicebot' in serverless.com
2. Create serverless project
    - npm install serverless -g
    - serverless create --template aws-nodejs --path voicebot
    - Update serverless.yml (as below)
```
service: voicebot
frameworkVersion: '2'
provider:
    name: aws
    runtime: nodejs12.x
    lambdaHashingVersion: 20201221
    profile: logesh-friend
    region: ap-south-1
    role: arn:aws:iam::032622477281:role/voicebot-app-role
functions:
    speak:
        handler: handler.speak
        events:
        - http:
            path: speak
            method: post
            cors: true
```
3. Create S3 bucket with name "my-voicebot-app" (Private)
4. Create IAM role:
    - Select service as 'Lambda' and use case 'Allows Lambda functions to call AWS services on your behalf.'
    - Policy access:
        - AmazonS3FullAccess
        - AmazonPollyFullAccess
    - Skip Tags:
    - Name: "voicebot-app-role"
    - Click 'Create'
5. Install node modules:
    - npm install aws-sdk
6. Deploy serverless app:
    - using 'serverless deploy' (Kindly ensure aws credentials configured)
6. To update function:
    - serverless deploy function -f voicebot-dev-speak


Endpoint for converting SSML to Voice (MP3): https://opkmby54sh.execute-api.ap-south-1.amazonaws.com/dev/speak [POST]
Endpoint for getting the saved mp3: https://opkmby54sh.execute-api.ap-south-1.amazonaws.com/dev/getVoiceByKey [GET]
Endpoint for getting the twilio phone numbers: https://opkmby54sh.execute-api.ap-south-1.amazonaws.com/dev/getPhoneNumbers [GET]

Example:
Available polly voices = ["Salli", "Joanna", "Ivy",  "Kendra", "Kimberly", "Matthew", "Justin", "Joey"];
Sample Request [POST]:
```
fetch('https://opkmby54sh.execute-api.ap-south-1.amazonaws.com/dev/speak', {
    method: 'POST',
    body: JSON.stringify({
        "dialogueHash": "My-first-uniqueid",
        "text": "<speak>Here are <say-as interpret-as=\"characters\">SSML</say-as> samples. I can pause <break time=\"3s\"/>. I can speak in cardinals. Your number is <say-as interpret-as=\"cardinal\">10</say-as>. Or I can speak in ordinals. You are <say-as interpret-as=\"ordinal\">10</say-as> in line. Or I can even speak in digits. The digits for ten are <say-as interpret-as=\"characters\">10</say-as>. I can also substitute phrases, like the <sub alias=\"World Wide Web Consortium\">W3C</sub>. Finally, I can speak a paragraph with two sentences. <p><s>This is sentence one.</s><s>This is sentence two.</s></p></speak>",
        "voice": "Joanna",
        "textContentType": "ssml"
    }),
    headers: {
        "Content-type": "application/json; charset=UTF-8"
    }
})
.then(res => res.json())
.then(json => console.log(json))
.catch(err => console.log(err))
```
Sample Request [GET]:
```
fetch('https://opkmby54sh.execute-api.ap-south-1.amazonaws.com/dev/getVoiceByKey?dialogueHash=My-first-uniqueid')
.then(res => res.json())
.then(json => console.log(json))
.catch(err => console.log(err))
```
Sample Request [GET]:
```
fetch('https://opkmby54sh.execute-api.ap-south-1.amazonaws.com/dev/getPhoneNumbers?region=CA&areaCode=604&limit=20')
.then(res => res.json())
.then(json => console.log(json))
.catch(err => console.log(err))
```