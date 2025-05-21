# Лабораторная работа 10
## Знакомство с масштабированием веб приложений на примере Kubernetes

### Структура проекта
```
├── README.md
├── api             
│   ├── Dockerfile             # Dockerfile для сборки API
│   ├── e2e
│   ├── package-lock.json
│   ├── package.json
│   └── src
├── docker-compose.local.yml   # docker compose файл для локальной разработки (сервисы PostgreSQL, Redis, RabbitMQ, MinIO)
├── docker-compose.yml         # docker compose файл для запуска всех сервисов (сервисы PostgreSQL, Redis, RabbitMQ, MinIO, API, Greeting Service)
├── greeting_service           # Greeting serivice
│   ├── Dockerfile             # Dockerfile для сборки Greeting Service
│   ├── package-lock.json
│   ├── package.json
│   └── src
└── k8s                        # Конфигурационные файла Kubernetes
```

### Цель работы
Познакомиться с контейнеризацией приложений на примере Docker, подготовить и выгрузить Docker образ в Docker Hub для последующего использования, познакомиться с процессом горизонтального и вертикального масштабирования веб приложений на примере Kubernetes

### Технические требования:
- Наличие интернет-соединения
- Наличие [Postman](https://www.postman.com/downloads/) или [Insomnia](https://insomnia.rest/download)
- Наличие [Node](https://nodejs.org/en) [v22 и выше] или наличие [NVM](https://github.com/nvm-sh/nvm) для переключения между версиями Node
- Наличие [Docker](https://docs.docker.com/desktop/)
- Наличие аккаунта в [Docker Hub](https://hub.docker.com/)
- Наличие [Kubernetes](https://kubernetes.io/releases/download/) (в ряде случаев Docker Desktop предоставляет возможность [использования Kubernetes из коробки](https://docs.docker.com/desktop/features/kubernetes/))

### Важное примечание
Работа выполнена в академических целях, поэтому ее использование в реальной среде сопряжено с некоторыми сложностям применительно к масштабированию PostgreSQL, Redis, RabbitMQ и MinIO. Иными словами для масштабирования PostgreSQL, Redis, RabbitMQ и MinIO применяют другие способы, однако в рамках лабораторной работы для простоты локального развертывания данный подход к деплою, представленный здесь, считается допустимым.

### Ход работы:
1. Создайте репозиторий в [Docker Hub](https://hub.docker.com/repositories/). При создании выберите Private Repository

2. Выполните вход в Docker Hub при помощи команды `docker login`

3. В корневой директории выполните команду `docker compose -f docker-compose.local.yml up -d`
    > Обратите внимание на наличие разницы в файлах `docker-compose.local.yml` и `docker-compose.yml`

4. В директории `api` выполните установку зависимостей при комощи команды `npm i`

5. В директорию `api` скопируйте файл `.env` из корневого каталога. Произведите замену значений `POSTGRES_HOST`, `RABBITMQ_HOST`, `REDIS_HOST` и `MINIO_ENDPOINT` в соответствии с наименованием текущего окружения, а именно `localhost`

6. Выполните модификацию файлов сервиса `api` с учетом наработок из предыдущих лабораторных работ.
    > Обратите внимание, конфигурационные файлы претерпели изменения и теперь импортируют строки конфигурации извне при помощи `.env` файла и зависимости [dotenv](https://www.npmjs.com/package/dotenv)

7. Выполните один из следующих сценариев:
    - запуск тестов с учетом изменений выше для проверки работоспособности приложения при помощи команды `npm test`
    - ручное тестирование работоспособности приложения и его основных ендпоинтов посредством Postman /Insomnia. Запуск приложения осуществялется командой `npm run start:dev`

    > Основная задача данного этапа заключается в проверке того, что переменные окружения установлены корректно. Для удобства дальнейшей работы с переменными окружения в файле `api/src/config/app.js` добавлен вывод переменных окружения. В случае необходимости внесите изменения в исходный код приложения.

8. Выполните контейнеризацию приложения. С этой целью воспользуйтесь `Dockerfile` внутри директории `api`, а также командой, запущенной в корневом каталоге `docker compose up -d`

9. Выполните ручное тестирование основных ендпоинтов приложения  посредством Postman /Insomnia. 
В случае необходимости внесения исправлений в исходный код воспользуйтесь флагом `--build`

    `docker compose up -d --build` для повторной сборки образа

10. Выполните остановку всех запущенных в Docker сервисов посредством команды `docker compose stop` в корневой директории. В случае успеха можно наблюдать следующий вывод

```
[+] Stopping 7/7
 ✔ Container greeting_service  Stopped                                                                                                    0.7s 
 ✔ Container api               Stopped                                                                                                    0.8s 
 ✔ Container pg_admin          Stopped                                                                                                    1.9s 
 ✔ Container rabbitmq          Stopped                                                                                                    1.5s 
 ✔ Container minio             Stopped                                                                                                    0.4s 
 ✔ Container redis             Stopped                                                                                                    0.3s 
 ✔ Container db                Stopped                                                                                                    0.2s 
```

11. Сформируйте Docker образ с помощью команды `docker build -t your-docker-username/your-docker-repository:1 .` внутри директории `api`
В случае успеха в консоли отобразится следующий вывод
```
[+] Building 1.5s (11/11) FINISHED                                                                                        docker:desktop-linux
 => [internal] load build definition from Dockerfile                                                                                      0.0s
 => => transferring dockerfile: 778B                                                                                                      0.0s
 => [internal] load metadata for docker.io/library/node:22-alpine                                                                         1.4s
 => [auth] library/node:pull token for registry-1.docker.io                                                                               0.0s
 => [internal] load .dockerignore                                                                                                         0.0s
 => => transferring context: 741B                                                                                                         0.0s
 => [1/5] FROM docker.io/library/node:22-alpine@sha256:ad1aedbcc1b0575074a91ac146d6956476c1f9985994810e4ee02efd932a68fd                   0.0s
 => [internal] load build context                                                                                                         0.0s
 => => transferring context: 321.29kB                                                                                                     0.0s
 => CACHED [2/5] WORKDIR /app                                                                                                             0.0s
 => CACHED [3/5] COPY package.json package-lock.json ./                                                                                   0.0s
 => CACHED [4/5] RUN npm install                                                                                                          0.0s
 => [5/5] COPY . ./                                                                                                                       0.0s
 => exporting to image                                                                                                                    0.0s
 => => exporting layers                                                                                                                   0.0s
 => => writing image sha256:0f67f5d8b15cb9634cb381d296fd3b7a971b268ffb8c65a86c82ef8e6ee573ca                                              0.0s
 => => naming to docker.io/dmitrium/lab-10-api                                                                                            0.0s

View build details: docker-desktop://dashboard/build/desktop-linux/desktop-linux/o05mnissjza6efs5s4hq8b7px

What's next:
    View a summary of image vulnerabilities and recommendations → docker scout quickview 
```
12. Выполните отправку Docker образа в Docker Hub с помощью команды `docker push your-docker-username/your-docker-repository:1` внутри директории `api`

    > В данном случае `1` является тегом. Часто в документации можно наблюдать тег `latest`. Однако в рамках выполнения данной лабораторной работы для каждой новой версии Docker образа рекомендуется использовать инкремент тега

В случае успеха в консоли отобразится следующий вывод
```
The push refers to repository [docker.io/dmitrium/lab-10-api]
3e2871dfa06a: Pushed 
ddbccd5e4c2e: Pushed 
e6c96166f5c2: Pushed 
aac3bca3f14b: Pushed 
899b97f186a0: Pushed 
4a4c2fa69568: Mounted from library/node 
32cd2f74c1f6: Mounted from library/node 
a16e98724c05: Mounted from library/redis 
latest: digest: sha256:ab7995990835ca4f9cfb7083a8fa871b7b5d9e57f27288e47fae46cfd8530711 size: 1994
```

13. Выполните модификацию файла `k8s/05-api/api-deployment.yaml`, а именно секцию `image:` в соответствии с приведенным паттерном `your-docker-username/your-docker-repository`

14. Выполните последовательно команды для запуска инфраструктуры
```
kubectl apply -f k8s/00-namespace.yaml

kubectl apply -f k8s/01-postgresql/

kubectl apply -f k8s/02-redis/

kubectl apply -f k8s/03-minio/

kubectl apply -f k8s/04-rabbitmq/

kubectl apply -f k8s/05-api/
```

15. Верифицируйте запуск сервисов посредством команды `kubectl get all -n lab-10-app`

В случае успеха можно наблюдать следующий вывод

```
NAME                              READY   STATUS      RESTARTS      AGE
pod/init-minio-x9298              0/1     Completed   0             48s
pod/lab-10-app-5587d8cff8-5vcdg   1/1     Running     2 (33s ago)   38s
pod/lab-10-app-5587d8cff8-m9zn7   1/1     Running     2 (33s ago)   38s
pod/minio-b6f9f56dd-gs7mg         1/1     Running     0             48s
pod/postgresql-0                  1/1     Running     0             58s
pod/rabbitmq-0                    1/1     Running     0             43s
pod/redis-575b58d87c-vmgds        1/1     Running     0             53s

NAME                 TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)              AGE
service/lab-10-app   LoadBalancer   10.102.127.62    localhost     80:32616/TCP         38s
service/minio        ClusterIP      10.98.46.53      <none>        9000/TCP             48s
service/postgresql   ClusterIP      10.105.219.172   <none>        5432/TCP             58s
service/rabbitmq     ClusterIP      10.103.213.50    <none>        5672/TCP,15672/TCP   43s
service/redis        ClusterIP      10.96.77.201     <none>        6379/TCP             53s

NAME                         READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/lab-10-app   2/2     2            2           38s
deployment.apps/minio        1/1     1            1           48s
deployment.apps/redis        1/1     1            1           53s

NAME                                    DESIRED   CURRENT   READY   AGE
replicaset.apps/lab-10-app-5587d8cff8   2         2         2       38s
replicaset.apps/minio-b6f9f56dd         1         1         1       48s
replicaset.apps/redis-575b58d87c        1         1         1       53s

NAME                          READY   AGE
statefulset.apps/postgresql   1/1     58s
statefulset.apps/rabbitmq     1/1     43s

NAME                   STATUS     COMPLETIONS   DURATION   AGE
job.batch/init-minio   Complete   1/1           10s        48s
```

16. Выполните следующий cURL запрос
```
curl --location 'localhost:80/health'
```
В качестве результата будет получен ответ
```
{
    "status": "ok",
    "host": "lab-10-app-7c99bb588b-9tml2"
}
```

> Обратите внимание на поле `host` - это идентификатор активного пода

17. Выполните дважды следующий cURL запрос

```
curl --location 'localhost:80/load'
```

В результате при повторном вызове следующего cURL
```
curl --location 'localhost:80/health'
```

Ответ со стороны API не последует, поскольку из 2 активных подов 2 загружены полностью

18. Выполните добавление дополнительных реплик для сервиса `api` сервиса посредством команды `kubectl scale deployment lab-10-app --replicas=4 -n lab-10-app`

19. В результате выполнения команды `kubectl get all -n lab-10-app` можно наблюдать дополнительные pods

```
pod/init-minio-vsctn              0/1     Completed   0             70s
pod/lab-10-app-776596d5bf-6f8jt   1/1     Running     0             14s
pod/lab-10-app-776596d5bf-gqhmc   1/1     Running     0             14s
pod/lab-10-app-776596d5bf-ktqst   1/1     Running     2 (64s ago)   70s
pod/lab-10-app-776596d5bf-nkwq9   1/1     Running     2 (64s ago)   70s
pod/minio-b6f9f56dd-tkxm2         1/1     Running     0             70s
pod/postgresql-0                  1/1     Running     0             71s
pod/rabbitmq-0                    1/1     Running     0             70s
pod/redis-575b58d87c-v7t79        1/1     Running     0             71s

NAME                 TYPE           CLUSTER-IP       EXTERNAL-IP   PORT(S)              AGE
service/lab-10-app   LoadBalancer   10.102.139.168   localhost     80:31160/TCP         70s
service/minio        ClusterIP      10.107.183.158   <none>        9000/TCP             70s
service/postgresql   ClusterIP      10.107.116.78    <none>        5432/TCP             71s
service/rabbitmq     ClusterIP      10.109.208.31    <none>        5672/TCP,15672/TCP   70s
service/redis        ClusterIP      10.99.50.175     <none>        6379/TCP             71s

NAME                         READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/lab-10-app   4/4     4            4           70s
deployment.apps/minio        1/1     1            1           70s
deployment.apps/redis        1/1     1            1           71s

NAME                                    DESIRED   CURRENT   READY   AGE
replicaset.apps/lab-10-app-776596d5bf   4         4         4       70s
replicaset.apps/minio-b6f9f56dd         1         1         1       70s
replicaset.apps/redis-575b58d87c        1         1         1       71s

NAME                          READY   AGE
statefulset.apps/postgresql   1/1     71s
statefulset.apps/rabbitmq     1/1     70s

NAME                   STATUS     COMPLETIONS   DURATION   AGE
job.batch/init-minio   Complete   1/1           10s        70s
```

20. Выполните следующий cURL запрос, чтобы удостовериться, что новые поды начали обработку входящих запросов

```
curl --location 'localhost:80/health'
```

При этом в ответе поле `host` будет иметь значение, отличное от использовавшихся на предыдущих шагах

### CLI:

```
# Создание образа локально
docker build -t your-docker-username/your-docker-repository .

# Отправка образа в Docker Hub
docker push your-docker-username/your-docker-repository:latest

# Create namespace
kubectl apply -f k8s/00-namespace.yaml

# Deploy PostgreSQL
kubectl apply -f k8s/01-postgresql/

# Deploy Redis
kubectl apply -f k8s/02-redis/

# Deploy MinIO
kubectl apply -f k8s/03-minio/

# Deploy RabbitMQ
kubectl apply -f k8s/04-rabbitmq/

# Deploy Node.js application
kubectl apply -f k8s/05-api/

# Check all resources in the namespace
kubectl get all -n lab-10-app

# Check specific deployments
kubectl get deployments -n lab-10-app
kubectl get statefulsets -n lab-10-app

# Check services
kubectl get svc -n lab-10-app

# Check pods
kubectl get pods -n lab-10-app

# Check logs for a specific pod
kubectl logs -f <pod-name> -n lab-10-app

# Get the external IP for the Node.js application
kubectl get svc lab-10-app -n lab-10-app

# For minikube
minikube service lab-10-app -n lab-10-app

# Access RabbitMQ management console (if exposed)
kubectl port-forward svc/rabbitmq 15672:15672 -n lab-10-app
# Then open http://localhost:15672 in your browser

# Scale the Node.js application
kubectl scale deployment lab-10-app --replicas=4 -n lab-10-app

# Delete all resources in the namespace
kubectl delete namespace lab-10-app

# Or delete individually
kubectl delete -f k8s/06-ingress.yaml
kubectl delete -f k8s/05-api/
kubectl delete -f k8s/04-rabbitmq/
kubectl delete -f k8s/03-minio/
kubectl delete -f k8s/02-redis/
kubectl delete -f k8s/01-postgresql/
kubectl delete -f k8s/00-namespace.yaml
```

### Документация:
[Docker CLI](https://docs.docker.com/reference/cli/docker/image/push/)

[Kubernetes](https://kubernetes.io/docs/home/)

### Контрольные вопросы:
1. Что такое Kubernetes?

2. Что такое service, pod и namespace?

3. Как представлены секреты в Kubernetes?

4. Что такое горизонтальное и вертикальное масштабирование?

5. Для чего предназначен ендпоинт `GET /health`?

6. Как Kubernetes определяет недоступность пода?

7. Что такое Statefulset?

8. Что такое реплика?
