<?php

namespace SudiptoChoudhury\TimeDoctor;

use SudiptoChoudhury\Support\Forge\Api\Client as ApiForge;

/**
 * Class Api
 *
 * @method	array	getCompanies(array $parameters = [])
 * @method	array	getProjects(array $parameters)
 * @method	array	getUsers(array $parameters)
 * @method	array	getUser(array $parameters)
 * @method	array	getUserTasks(array $parameters)
 * @method	array	getUserTask(array $parameters)
 * @method	array	getWorklogs(array $parameters)
 *
 * @inheritdoc
 *
 * @package SudiptoChoudhury\TimeDoctor
 */
class Api extends ApiForge
{

    protected $DEFAULT_API_JSON_PATH = './config/timedoctor.json';
    protected $loggerFile = __DIR__ . '/timedoctor-api-calls.log';

    protected $DEFAULTS = [
        'access_token' => '',
        'client' => [
            'base_uri' => 'https://webapi.timedoctor.com',
            'headers' => [
                "Authorization" => "Bearer {{access_token}}"
            ],
        ],
        'settings' => [
            'responseHandler' => null,
            'requestHandler' => null,
        ],
        'log' => false
    ];
}