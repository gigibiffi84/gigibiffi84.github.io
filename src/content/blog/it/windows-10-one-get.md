---
title: "Windows 10 includerà un sistema di package management stile apt-get"
description: "Dopo Chocolatey a quanto pare Windows10 includerà un sistema unico di gestione dei pacchetti  multi repository."
date: 2015-09-10
tags: ["package-manager", "chocolatey", "oneget", "windows package manager", "windows"]
lang: it
translationKey: "windows-10-one-get"
---

Dopo l'uscita di Windows10 sarà possibile provare il sistema di CmdLet descritto tempo fa da Garrett Serack in [questo](http://blogs.msdn.com/b/garretts/archive/2014/04/01/my-little-secret-windows-powershell-oneget.aspx) articolo. Il nome del progetto è OneGet ed è  open source, infatti è presente il [progetto](https://github.com/OneGet/oneget) su GitHub e la struttura del repository è ben documentata. 
Sinceramente non sono riuscito ancora a provare OneGet e ricitando le parole di Garrett:

> OneGet is a unified interface to package management systems and aims to make Software Discovery, Installation and Inventory (SDII) work via a common set of cmdlets (and eventually a set of APIs). Regardless of the installation technology underneath, users can use these common cmdlets to install/uninstall packages, add/remove/query package repositories, and query a system for the software installed. Included in this CTP is a prototype implementation of a Chocolatey-compatible package manager that can install existing Chocolatey packages.

sembra che il problema di avere un repository popolato sia superato poiché OneGet è compatibile anche con i repository di Chocolatey. Effettivamente sia OneGet che Chocolatey sono basati entrambi su NuGet quindi c'era da aspettarselo.

Per chi è abituato ad usare apt-get l'esperienza di utilizzo di OneGet sarà un po' diversa, infatti invece di offrire dei *command switches* offre una serie di ***CmdLet***. Un esempio di CmdLet  per cercare i nostri pacchetti potrebbe essere:

```
# get a list of registered package sources
PS C:\> Get-PackageSource
 
Name         Location                      Provider     IsTrusted
 ----         --------                      --------     ---------
chocolatey   http://chocolatey.org/api/v2  Chocolatey   False
```

oppure per installare un pacchetto:
```
# Install a package
PS C:\> Install-Package -name zoomit
 
Name           Version     Status      Source        Summary                                                    
 ----           -------     ------      ------         -------                                                     
zoomit         4.50        Installed   chocolatey     ZoomIt is ascreen zoom and...
```

Una differenza importante tra OneGet e Chocolatey è che OneGet sarà utilizzabile solamente dalla PowerShell di Windows, mentre Chocolatey una volta installato, sarà utilizzabile anche da una normalissima shell di Windows.
