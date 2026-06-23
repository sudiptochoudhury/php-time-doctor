# php-time-doctor

PHP API Client for Time Doctor API and nodeJS MCP Server for Time Doctor API.

> Read all about Time Doctor API from [timedoctor.com](https://webapi.timedoctor.com/doc)

## Quick Steps: 

### STEP 1:
Get [TimeDoctor `access_token`](https://webapi.timedoctor.com/doc#authentication) and store it in a file named `timedoctor.json` in the root of your project. The file should contain the following JSON data:

```
{
    "access_token": "<<access_token>>"
}
```

### STEP 2:

run CLI commands 

#### Command 1:
```
php timedoctor 
```

You are likely to see this:

```
Time Doctor API CLI tool - v1.0.0
Use --help or -h for help.
```

> If you are in Linux or MacOS, you can make the file executable by running the following command:

```
chmod +x timedoctor
```
and then run the command as (without `php`):

```
./timedoctor
```

#### Command 2:
```
php timedoctor -h 
```

You are likely to see this:

```
Time Doctor API CLI tool - v1.0.0
Use --help or -h for help.
```


#### Command 3:
```
php timedoctor getCompanies 
```
You see see User and Company information in JSON format.
You can copy the company id for future use.


#### Command 4:
Get worklogs for a company between two dates. You need to pass `company_id`, `start_date` and `end_date` as parameters.
```
php timedoctor getWorklogs --company_id=2348758 --start_date=2026-06-01 --end_date=2026-06-30
```

You are likely to get a JSON response with worklogs for the given company between the given dates. 
It does not give the total but enough information to calculate the total time etc.

---
## Using MCP Server

> Make sure you have setup the CLI having `timedoctor.json` file in the root of your project with `access_token` as described above.

JSON entry in MCP server JSON configuration file.

```json
{
  "mcpServers": {
    "timedoctor": {
      "command": "node",
      "args": [
        "/path/to/your/project/timedoctor/mcp/server.js"
      ]
    }
  }
}
```

> For more details on how to setup MCP server, please refer to [Time Doctor MCP Server](./mcp/README.md).

Once, the MCP server is setup, you can use the tools in your MCP client.

Example prompts:

```
Get my timedoctor company name and id
```

If memory is enabled, you can also ask:
```
Remember my timedoctor company id
```
then,
```
Show my timedoctor worklogs and calculate total time in hours and minutes for the last 7 days 
```

---


## Using in PHP

Get [TimeDoctor `access_token`](https://webapi.timedoctor.com/doc#authentication) and use it.

```php

use SudiptoChoudhury\TimeDoctor\Api;

$td = new Api([
    'access_token' => '<<access_token>>'
]);


$result = $td->getCompanies(); 

$result = $td->getWorklogs([
    'company_id' => '2348758',
    "start_date" => '2020-08-16',
    'end_date' => '2020-08-31'
]);
 
```

## Installation


### Requirements

- Any flavour of PHP 7.1+ should do


### Install With Composer

You can install the library via [Composer](http://getcomposer.org) by adding the following line to the 
**require** block of your *composer.json* file (replace dev-master with the latest stable version):

```
"sudiptochoudhury/php-time-doctor": "dev-master"
```

or run the following command:

```
composer require sudiptochoudhury/php-time-doctor
```


## Setting up

### Authenticate

Below are two OAuth2.0 strategies you can choose when implementing this.

> Before this, you need to register your Time Doctor Application as described [here](https://webapi.timedoctor.com/doc#authentication), setup `redirect_url` and get the `client_id`, `client_secret` from the application.


#### For Web Server based/Desktop/Native applications

Authorization Code Grant flow: This flow is useful if you have your own server for your app (most common for traditional web apps, as well as native desktop and mobile apps).

**Step 1 - Get Code**

```php
use SudiptoChoudhury\TimeDoctor\OAuth;

$tdOAuth = new OAuth();
$tdOAuth->getAuthCode([
    'client_id' => '', // pass your client_id here 
    'redirect_uri' => '' // set your redirect_url here
]);
```
This will open authentication portal of your Time Doctor Application and on successful authentication redirect to the 
given `redirect_url` (an url of your main application) (provided that this url is registered in your Time Doctor Application) with a `code` in it's querystring.

Your site's code should collect and store this code for the next step. 

**Step 2 - Generate access_token**
```php
use SudiptoChoudhury\TimeDoctor\OAuth;

$tdOAuth = new OAuth();
$tdOAuth->getToken([
    'client_id' => '',  // pass your client_id here 
    'client_secret' => '',  // pass your client_secret here 
    'redirect_uri' => '', // pass your redirect_url here 
    'code' => '' // set here the code you received in Step 1 stated above
]);

```
You will receive a set of values similar to the one give below:
```
{
    "access_token": "342019_MGQ1MjNiNDEzNzJmMGEzNDgyYWY3M2QA2YTZimjY3ZTFFYzBhNTAxMjEyMjM0MmMwMTFiOWJjOZzZ2NiZDMzMQ",
    "expires_in": 432000,
    "token_type": "bearer",
    "scope": null,
    "refresh_token": "342019_MjQyN2U4ZQAxMzA4ZjRlQTExNGMzQDMzZmQlZjM0QTQwMQU1OTdQNjI0OQNlZDlmNmJiOXZkNWRjOTc3N2YjNg"
}
```
Store the `access_token` and `refresh_token` for future use.

`access_token` will be required in all Time Doctor API calls, while
`refresh_token` will be needed to re-generate access token on expiration. 
`access_token`  has a limited life span as shown by `expires_in` (in seconds) property of the received data. The `expires_in` shown in the example data above calculated to 5 days. 
 
 The step below shows how to re-generate `access_token` on expiration.


**Retrieve access_token on expiration using Refresh Token**

```php
use SudiptoChoudhury\TimeDoctor\OAuth;

$tdOAuth = new OAuth();
$tdOAuth->refreshToken([
    'client_id' => '',  // pass your client_id here 
    'client_secret' => '', // set your client_secret here
    'refresh_token' => '' // set your refresh_token here
]);

```

#### For Web Server-less applications

Implicit Grant flow: Useful when you don't have your own server for your app (suitable for in-browser web apps, such as single-site apps written in JavaScript that cannot make arbitrary GET requests to our public API).

```php
use SudiptoChoudhury\TimeDoctor\OAuth;

$tdOAuth = new OAuth();
$tdOAuth->getAuthToken([
    'client_id' => '', // pass your client_id here      
    'redirect_uri' => '' // pass your redirect_url here 
]);

```

### Use 


All you need to do is to pass TimeDoctor `access_token` to the constructor. 
```php

use SudiptoChoudhury\TimeDoctor\Api;

new Api([
    'access_token' => '<<access_token>>',
]);
```

Additionally, you can set a logger via `log` property.

- You can set log to `false` to disable logging.
- You can also pass an array with `file` and `path` properties.

```php

use SudiptoChoudhury\TimeDoctor\Api;

new Api([
    'access_token' => '<<access_token>>',
    'log' => ['file' => 'TimeDoctor.log', 'path' => '/your/log/path']
]);
```
- You can also pass a `Monolog\Logger` instance.

```php

use SudiptoChoudhury\TimeDoctor\Api;

new Api([
    'access_token' => '<<access_token>>',
    'log' => ['logger' => $monologInstance]
]);
```

You can use `client` property to forward to `GuzzleHttp\Client` constructor. 

```php

use SudiptoChoudhury\TimeDoctor\Api;

new Api([
    'access_token' => '<<access_token>>',
    'client' => ['timeout' => 5]
]);
```

If you wish to tap into request and response handler stacks use `settings` instead of using `client`'s `handlers` property.

```php 
'settings' => [
    'responseHandler' => function (ResponseInterface $response) {
        // do something
        return $response;
    },
    'requestHandler' => function (RequestInterface $request) {
        // some action
        return $request;
    },
],
```
 

## How to use

Next, call the desired method from the table given below. In most methods you may need to pass parameters. The parameters
are to be passed as an associative array. 

Examples:
```php

use SudiptoChoudhury\TimeDoctor\Api;

$td = new Api([
    'access_token' => '<<access_token>>'
]);


$result = $td->getCompanies(); 

$result = $td->getWorklogs([
    'company_id' => '2348758',
    "start_date" => '2020-08-16',
    'end_date' => '2020-08-31'
]);

 
```


### Available API Methods

| Method | Parameters | Description |
|-------------------|------------|-------------|
| `getCompanies(array = [])`|  | Returns the user's account(s) | 
| `getProjects(array)`| offset limit all | Returns a collection of a user's projects  |
| `getUsers(array)` |  company_id emails include_manager | Returns a collection of the company's users |
| `getUser(array)` | company_id, user_id | Returns info about a user |
| `getUserTasks(array)` | company_id  user_id offset limit  status latest_first | Returns a collection of a user's tasks |
| `getUserTask(array)` | company_id user_id  task_id | Returns info about a user's task  |
| `getWorklogs(array)` | company_id start_date end_date offset limit user_ids project_ids task_ids fields breaks_only consolidated last_modified | Returns a collection of all user's worklogs under the given company Id  |

### Available OAuth API Methods
| Method | Parameters | Description |
|-------------------|------------|-------------|
| `getAuthCode(array)`|  |  | 
| `getToken(array)`|  |  |
| `refreshToken(array)`|  |   |
| `getAuthToken(array)` |  |
