# Biblioteca MVC
## Este repositório é um projeto acadêmico desenvolvido para simular uma biblioteca para fins educacionais.
Para rodar basta ter configurado um banco de dados no application-properties, configurar seu username e senha.
O projeto já inclui chave pública e privada para codificação e decodificação. Caso queira utilizar outra chave.
Rode o seguinte comando em seu terminal na pasta ~/resources/keys
```
  openssl genrsa -out app.key 4096
  openssl rsa -in app.key -pubout -out app.pub
```

Para rodar o projeto
```
  ./mvn clean package spring-boot:run
```

ou

```
  ./mvnw clean package spring-boot:run
```

# Tecnologias utilizadas:
  Java 21
  Spring (JPA, Web, Security)
  Validation
  OAuth2ResourceServer (codificar e decodificar JWT)
  MySQL
  HTML, CSS, Js (view)

# Arquitetura em camadas:
  Model
  Controller
  Service
  Repository
  DTOs
