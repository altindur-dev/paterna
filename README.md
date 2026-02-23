# Paterna - Produkte Landing Web (.NET Backend)

Ky projekt është një aplikacion i thjeshtë web për faqe uljeje që shet produkte të frymëzuara nga arkitektura, me mbështetje për hyrje/regjistrim dhe një backend .NET.

## Karakteristikat
- Faqja uljeje e listës së produkteve
- Formularët e hyrjes dhe regjistrimit
- API për autorizim dhe produkte në memorie
- Frontend statik i shërbyer nga ASP.NET Core

## Arkitektura
Ky implementim ndjek **Arkitekturën Hexagonal + Onion**:

- **Domain (`Paterna.Domain`)**: entitete kryesore (`Product`, `User`).
- **Aplikacioni (`Paterna.Application`)**: raste përdorimi dhe porta (ndërfaqe).
- **Infrastruktura (`Paterna.Infrastructure`)**: adaptorë për depo dhe mekanizma hashing/token.
- **API (`Paterna.Api`)**: shtresa e shpërndarjes që ekspozon pikat fundore HTTP dhe faqen statike.

### Shtegu i gatshëm për server
Për ta zhvendosur këtë në **Arkitekturë pa server**, mbajeni të pandryshuar Domenin/Aplikacionin dhe zëvendësoni adaptorët API+Infrastrukturë me:
- Funksionet Azure / trajtuesit HTTP AWS Lambda
- ofruesin e identitetit të menaxhuar + adaptorët e bazës së të dhënave

## Modelet e Dizajnit të përdorura
- **Creational**: Modeli i fabrikës nëpërmjet `ITokenFactory` dhe `BasicTokenFactory` konkret.
- **Structural**: Modeli i adaptorit në depot e Infrastrukturës që implementojnë portet e Aplikacionit.
- **Behavioural**: Modeli i strategjisë nëpërmjet implementimeve të këmbyeshme `IPasswordHasher`.

## API
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/products`

## Ekzekutoni
```bash
dotnet run --project src/Paterna.Api
```
Pastaj hapni `http://localhost:5000` (ose portin e treguar).
