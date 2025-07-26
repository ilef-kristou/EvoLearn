<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class ChargeAccountCreated extends Mailable
{
    public $user;
    public $password;

    public function __construct($user, $password)
    {
        $this->user = $user;
        $this->password = $password;
    }

    public function build()
    {
        return $this->subject('Votre compte chargé de formation')
            ->view('emails.charge_account_created')
            ->with([
                'user' => $this->user,
                'password' => $this->password,
            ]);
    }
} 