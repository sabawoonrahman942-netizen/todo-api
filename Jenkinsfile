pipeline {
    agent any
    options { disableConcurrentBuilds() }
    stages {
        stage('CI - Kaynak kod') {
            steps {
                checkout scm
                sh 'test -f Dockerfile && test -f app.py'
            }
        }
        stage('CD - Docker') {
            steps {
                sh 'docker compose up --build -d'
            }
        }
        stage('Servis kontrolü') {
            steps {
                sh 'curl --retry 10 --retry-connrefused --retry-delay 2 --fail http://localhost:5000/health'
            }
        }
    }
}
