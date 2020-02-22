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



var app = {
    // Application Constructor
    initialize: function() {
        //document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        document.addEventListener('deviceready', function () {
           
            getToken();

            setInterval(getToken, 1200000);

                let options = {
                    language: 'en-US',
                    matches: 1,
                    prompt: "",      // Android only
                    showPopup: true,  // Android only
                    showPartial: true 
                 }
                 document.getElementById('msg').innerHTML = '';
                 document.getElementById('speech').value = '';
                 document.getElementById('start').addEventListener('click', function(){
                    document.getElementById('speech').value = '';
                    document.getElementById('msg').innerHTML = 'Listening Started..';
                    window.plugins.speechRecognition.startListening(
                        (response) => {
                            console.log('response got');
                            console.log(JSON.stringify(response))
                            const speech = response.join();
                           document.getElementById('speech').value = speech;
                           speechText = speech;
                        }, (err) => {
                            console.log(JSON.stringify(err))
                        },  options)
                })
        
               
                document.getElementById('send').addEventListener('click', connectDialogFlow);
                 
                 

                window.plugins.speechRecognition.getSupportedLanguages(
                    function(lang){
                        console.log('Supported languages..');
                        console.log(JSON.stringify(lang));
                    }, function(err){
                        console.log(err)
                });

                
            

        }, false);


    },

    
};

app.initialize();

function connectDialogFlow(){

    window.plugins.speechRecognition.stopListening(
        () => {
            document.getElementById('msg').innerHTML = 'Listening Stopped..';
        }, (err) => {
            console.log(err)
        });

    document.getElementById('msg').innerHTML = 'Dialogflow service called.';
    postData(DIALOGFLOW_URL,
    {
        queryInput: {
            text: {
                text: speechText || document.getElementById('speech').value,
                languageCode: "en-US"
            }
        },
    })
    .then((data) => {
        console.log(JSON.stringify(data)); // JSON data parsed by `response.json()` call
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
method: 'POST', // *GET, POST, PUT, DELETE, etc.
mode: 'cors', // no-cors, *cors, same-origin
cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
credentials: 'same-origin', // include, *same-origin, omit
headers: {
    'Content-Type': 'application/json',
    "Authorization" : 'Bearer '+ localStorage.getItem('access_token')
    // 'Content-Type': 'application/x-www-form-urlencoded',
},
redirect: 'follow', // manual, *follow, error
referrerPolicy: 'no-referrer', // no-referrer, *client
body: JSON.stringify(data) // body data type must match "Content-Type" header
});
return await response.json(); // parses JSON response into native JavaScript objects
}

