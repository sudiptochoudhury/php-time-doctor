<?php

namespace SudiptoChoudhury\TimeDoctor;

/**
 * Class OAuth
 *
 * @method	array	getAuthCode(array $parameters)
 * @method	array	getAuthToken(array $parameters)
 * @method	array	getToken(array $parameters)
 * @method	array	refreshToken(array $parameters)
 *
 * @inheritdoc
 *
 * @package SudiptoChoudhury\TimeDoctor
 */
class OAuth extends Api
{
    protected $DEFAULT_API_JSON_PATH = './config/timedoctor-oauth.json';
    protected $loggerFile = __DIR__ . '/timedoctor-oauth-api-calls.log';

    protected $DEFAULTS = [
        'access_token' => '',
        'client' => [
            'base_uri' => 'https://webapi.timedoctor.com',
            'headers' => [

            ],
        ],
        'settings' => [
            'responseHandler' => null,
            'requestHandler' => null,
        ],
        'log' => false
    ];
}