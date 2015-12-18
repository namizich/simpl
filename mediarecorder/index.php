<?php

$http_origin = $_SERVER['HTTP_ORIGIN'];

if ( strrpos($http_origin, "mysite1.net") || strrpos($http_origin, "mysite2") ){
    header("Access-Control-Allow-Origin: $http_origin");
}

header('Content-Type: application/json');

ini_set('display_errors', 1);
require_once('TwitterAPIExchange.php');

/** Set access tokens here - see: https://dev.twitter.com/apps/ **/
$settings = array(
  'oauth_access_token' => "240174331-5m0pFzA0nHQZlAdwUZH7CqLSLvqtZJl6WbGmJ9Dh
  ",
  'oauth_access_token_secret' => "hvAFQoyNclAcV6bzhHcRIHdO4olwjFt1mOxFNedsNmY1d",
  'consumer_key' => "sk2UtMvkJEiG6UibQwABTZXZW
  ",
  'consumer_secret' => "V6CayBoD3dBQfCYDU35zPmwscIHKD3t9EUl2PNPkPIuRSXgMCf"
  );


/** Perform a GET request and echo the response **/
/** Note: Set the GET field BEFORE calling buildOauth(); **/

$url = 'https://api.twitter.com/1.1/search/tweets.json';
$getfield = '?'.$_SERVER['QUERY_STRING'];
$requestMethod = 'GET';
$twitter = new TwitterAPIExchange($settings);

$api_response = $twitter ->setGetfield($getfield)
                     ->buildOauth($url, $requestMethod)
                     ->performRequest();

echo $api_response;

?>
