/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var speechText = "";
const ACCESS_TOKEN = "";
const CLIENT_ID = "35530924122-2isjro8mkt8plavabhkudqieg6f70esq.apps.googleusercontent.com";
const CLIENT_SECRET_ID = "G7N4XJa0_Pa_Vri_8tXD69Dn";
const REFRESH_TOKEN = "1//04-6PrB-6YZ0JCgYIARAAGAQSNwF-L9IrR7tg2-axoetVhBlAFjZNybmzpERA8GBVGRLCM5GaQa41STxLoLKXlMUQrSJOzQ5GoRM";
const GAPI_URL = "https://oauth2.googleapis.com/token";
const DIALOGFLOW_URL = "https://dialogflow.googleapis.com/v2/projects/sia-poc-tmrqcp/agent/sessions/123456789:detectIntent";


var details = {
    'client_id': CLIENT_ID,
    'client_secret': CLIENT_SECRET_ID,
    'refresh_token': REFRESH_TOKEN,
    'grant_type': 'refresh_token'
};

var formBody = [];
for (var property in details) {
  var encodedKey = encodeURIComponent(property);
  var encodedValue = encodeURIComponent(details[property]);
  formBody.push(encodedKey + "=" + encodedValue);
}
formBody = formBody.join("&");

async function getToken(){
    try{
        const authData =  await fetch(GAPI_URL, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache', 
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            body: formBody
            });

        const response = await authData.json();

        if(response){
            localStorage.setItem('access_token', response.access_token);
        }
        
    }catch(err){
        console.log(err);
    }
}

 getToken();

setInterval(getToken, 60000 * 20);


var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', function () {
           
                let options = {
                    language: 'en-US',
                    matches: 1,
                    prompt: "",      // Android only
                    showPopup: true,  // Android only
                    showPartial: false 
                 }
                 document.getElementById('msg').innerHTML = '';
                 document.getElementById('speech').value = '';
                 document.getElementById('start').addEventListener('click', function(){
                    document.getElementById('msg').innerHTML = 'Listening Started..';
                    window.plugins.speechRecognition.startListening(
                        (response) => {
                            console.log("Response")
                            console.log(response)
                            const speech = response.join();
                           document.getElementById('speech').value = speech;
                           speechText = speech;
                        }, (err) => {
                            console.log(err)
                        },  options)
                })
        
                document.getElementById('stop').addEventListener('click', function(){
                    window.plugins.speechRecognition.stopListening(
                        () => {
                            document.getElementById('msg').innerHTML = 'Listening Stopped..';
                        }, (err) => {
                            console.log(err)
                        })
                });

                document.getElementById('send').addEventListener('click', connectDialogFlow);
                 
                 

                window.plugins.speechRecognition.getSupportedLanguages(
                    (lang) => {
                        console.log('Supported languages..');
                        console.log(lang);
                    }, (err) => {
                        console.log(err)
                });

        }, false);
    },
};

app.initialize();

function connectDialogFlow(){
    document.getElementById('msg').innerHTML = 'Dialogflow service called.';
    postData(DIALOGFLOW_URL,
    {
        queryInput: {
            text: {
                text: speechText,
                languageCode: "en-US"
            }
        },
    })
    .then((data) => {
        console.log(data); // JSON data parsed by `response.json()` call
        if(data && data.queryResult && data.queryResult.fulfillmentText ){
        if(data.queryResult.fulfillmentText.indexOf('leave_application') !== -1){
            SpeechBackResponse(data.queryResult.fulfillmentText, "leave_request.html");
        }else if(data.queryResult.fulfillmentText.indexOf('permission_application') !== -1){
            SpeechBackResponse(data.queryResult.fulfillmentText, "permission_request.html");
        }else {
            SpeechBackResponse(data.queryResult.fulfillmentText);
        }

        }
    });
}

function SpeechBackResponse(text, url){
    try{
        TTS
        .speak({
            text,
            locale: 'en-GB',
            rate: 0.75
        }).then(function () {
            alert('success');
        });
    }catch(e){
        console.log(e);
    }finally{
        if(url){
            window.location.href=url;
        }
    }
}

// Example POST method implementation:
async function postData(url = '', data = {}) {
// Default options are marked with *
const response = await fetch(url, {
method: 'POST', 
mode: 'cors', 
cache: 'no-cache', 
credentials: 'same-origin', 
headers: {
    'Content-Type': 'application/json',
    "Authorization" : 'Bearer '+ getLocalToken()
},
body: JSON.stringify(data)
});
return await response.json(); 
}

function getLocalToken(){
return localStorage.getItem('access_token');
}

