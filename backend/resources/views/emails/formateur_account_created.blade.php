<p>Bonjour {{ $user->prenom }} {{ $user->nom }},</p>
<p>Veuillez trouver ci dessous les identifiants de votre compte :</p>
<ul>
    <li>Email : {{ $user->email }}</li>
    <li>Mot de passe : {{ $password }}</li>
</ul> 