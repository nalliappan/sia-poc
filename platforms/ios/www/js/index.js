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
var app = {
    // Application Constructor
    initialize: function() {
        //document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        document.addEventListener('deviceready', function () {
           
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
                    document.getElementById('msg').innerHTML = 'Listening Started..';
                    window.plugins.speechRecognition.startListening(
                        (response) => {
                            const speech = response.join();
                           /*(if(speech.indexOf('leave') !== -1){
                                window.location.href="leave_request.html";
                           }else if(speech.indexOf('permission') !== -1){
                                window.location.href="permission_request.html";
                           }else{
                                document.getElementById('msg').innerHTML = 'Please ask some other query?';
                           }*/
                           document.getElementById('speech').value = speech;
                           speechText = speech;
                           //connectDialogFlow(speech);
                        }, () => {
                            console.log('error')
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
    postData('https://dialogflow.googleapis.com/v2/projects/sia-poc-tmrqcp/agent/sessions/123456789:detectIntent',
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
method: 'POST', // *GET, POST, PUT, DELETE, etc.
mode: 'cors', // no-cors, *cors, same-origin
cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
credentials: 'same-origin', // include, *same-origin, omit
headers: {
    'Content-Type': 'application/json',
    "Authorization" : 'Bearer ya29.c.Ko8BvQciPi6uo1-hPGr9V_ARYnBLkOj6E4Ux6FZLz0n28qOrEJNdz6oMYEJx8VsLVzzK9oSnFKDS1L6FZaofsM5LGGBIcGBHxDysaijpp2maS4Is1jIaHbEI18tCbi1xDoHlvLHaVCi5ytNSA_gi8LquaD91DSm2l0QTLlDkM6Jl66IF1-UUa08pfXSGvwWgMro'
    // 'Content-Type': 'application/x-www-form-urlencoded',
},
redirect: 'follow', // manual, *follow, error
referrerPolicy: 'no-referrer', // no-referrer, *client
body: JSON.stringify(data) // body data type must match "Content-Type" header
});
return await response.json(); // parses JSON response into native JavaScript objects
}

