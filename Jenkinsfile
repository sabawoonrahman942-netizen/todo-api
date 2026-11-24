pipeline {
    agent any
    options { disableConcurrentBuilds(); skipDefaultCheckout() }
    stages {
        stage('CI - Kaynak kod') {
            steps {
                checkout scm
                sh 'test -f Dockerfile && test -f app.py'
            }
        }
        stage('CD - Docker') {
            steps {
                sh 'docker compose -p todo-api up --build -d'
            }
        }
        stage('Servis kontrolü') {
            steps {
                sh '''
                    for i in $(seq 1 15); do
                        if docker compose -p todo-api exec -T todo-api python -c "import urllib.request; print(urllib.request.urlopen('http://127.0.0.1:5000/health', timeout=3).read().decode())"; then
                            exit 0
                        fi
                        sleep 2
                    done
                    exit 1
                '''
            }
        }
    }
}
