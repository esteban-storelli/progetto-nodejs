## Come utilizzare
Le uniche cose da configuarare sono:
### 1. DB
Copiare db.txt su MySQL o MariaDB
### 2. .env
- Rinominare .env.example a .env
- Riempire user e password + modifichare altri campi s necassario
- Per SESSION_SECRET iniserire una stinga casuale
- !! Per USER_AGENT questa è l'identificatore che l'API di Wikipedia richiede in modo da poter comunicare in caso si stessero facendo troppe richieste !!
  Il formato è "[nome_progetto]/[versione] ([email])"
  Per esempio USER_AGENT=progetto-node/1.0 (john.smoke@gmail.com)

😊
