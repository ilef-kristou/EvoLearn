<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class FormateurAccountCreated extends Mailable
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
        return $this->subject('Votre compte formateur')
            ->view('emails.formateur_account_created')
            ->with([
                'user' => $this->user,
                'password' => $this->password,
            ]);
    }
} 