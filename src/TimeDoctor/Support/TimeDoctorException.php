<?php


namespace SudiptoChoudhury\TimeDoctor\Support;

use \Exception;
use \Throwable;

class TimeDoctorException extends Exception
{
    public $data = [];

    /***
     * TimeDoctorException constructor.
     *
     * @param string          $message
     * @param int             $code
     * @param \Throwable|null $previous
     * @param array           $data
     */
    public function __construct($message = "", $code = 0, Throwable $previous = null, $data = [])
    {
        $this->data = $data;
        parent::__construct($message, $code, $previous);
    }

    /**
     * @param $response
     *
     * @throws \SudiptoChoudhury\TimeDoctor\Support\TimeDoctorException
     */
    public static function make($response)
    {
        if (!empty($response['Code'])) {
            $description = $response['Description'] ?? '';
            $data = explode(':', $description);
            $message = trim($data[2] ?? $data[1] ?? $data[0]) ?: 'Unknown TimeDoctor error!';
            throw new TimeDoctorException($message, $response['Code'], null, $response);
        }
    }
}
