

# Ativacao FH

#### Listar ONU
```json
{
"user": "admin",
"pass": "admin",
"command": "LST-UNREGONU:::NMS_API::;",
"priority": 7
}
```
#### Verificar sinal da PON

```json
{
"user": "admin",
"pass": "admin",
"command": "LST-OMDDM::OLTID=10.0.24.201,PONID=NA-NA-12-5,SLOTNO=12,PONNO=5:NMS_API::;",
"priority": 7
}
```
#### Ativar ONU

```json
{
"user": "admin",
"pass": "admin",
"command": "ADD-ONU::OLTID=10.0.24.201,PONID=NA-NA-12-5:NMS_API::AUTHTYPE=MAC,ONUID=ZTEGd4d09b0b,NAME=BRD - 71414 - AVENIDA CAMPOS SALES 5017,ONUTYPE=HG6145E;",
"priority": 5
}
```

#### Verificar sinal da ONU

```json
{
"user": "admin",
"pass": "admin",
"command": "LST-OMDDM::OLTID=10.0.24.201,PONID=NA-NA-12-5,SLOTNO=12,PONNO=5,ONUIDTYPE=MAC,ONUID=ZTEGd4d09b0b:NMS_API::;",
"priority": 5
}
```


#### Configurar WAN VEIP


```json
{
"user": "admin",
"pass": "admin",
"command": "CFG-VEIPSERVICE::OLTID=10.0.24.201,PONID=NA-NA-12-5,ONUPORT=NA-NA-NA-1,ONUIDTYPE=MAC,ONUID=ZTEGd4d09b0b:NMS_API::CVLANID=2000,ServiceType=DATA,ServiceModelProfile=TRANSPARENT;",
"priority": 5
}
```


