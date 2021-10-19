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


Endpoint for converting SSML to Voice (MP3): https://nc7dvn9q6l.execute-api.ap-south-1.amazonaws.com/dev/speak [POST]
