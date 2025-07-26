<p>Bonjour {{ $user->prenom }} {{ $user->nom }},</p>
<p>Votre compte formateur a été créé.</p>
<p>Identifiants :</p>
<ul>
    <li>Email : {{ $user->email }}</li>
    <li>Mot de passe : {{ $password }}</li>
</ul>
<p>Merci de vous connecter et de changer votre mot de passe dès la première connexion.</p> 