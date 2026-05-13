pipeline {
  agent any

  environment {
    FRONTEND_DIR = 'frontend'
    BACKEND_DIR = 'backend'
    FRONTEND_IMAGE = 'kiadt/todo-list-frontend'
    BACKEND_IMAGE = 'kiadt/todo-list-backend'
    DOCKER_TAG = "${env.BUILD_NUMBER}"
    KUBE_NAMESPACE = 'todo-list'
  }

  triggers {
    githubPush()
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build') {
      steps {
        dir(env.FRONTEND_DIR) {
          sh 'npm ci'
          sh 'npm run build'
        }
        dir(env.BACKEND_DIR) {
          sh 'go build ./...'
        }
      }
    }

    stage('Test') {
      steps {
        dir(env.FRONTEND_DIR) {
          sh 'npm run lint'
        }
        dir(env.BACKEND_DIR) {
          sh 'go test ./...'
        }
      }
    }

    stage('Docker Build') {
      steps {
        sh 'docker build -t ${FRONTEND_IMAGE}:${DOCKER_TAG} -t ${FRONTEND_IMAGE}:latest ./frontend'
        sh 'docker build -t ${BACKEND_IMAGE}:${DOCKER_TAG} -t ${BACKEND_IMAGE}:latest ./backend'
      }
    }

    stage('Push to Hub') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
          sh 'docker push ${FRONTEND_IMAGE}:${DOCKER_TAG}'
          sh 'docker push ${FRONTEND_IMAGE}:latest'
          sh 'docker push ${BACKEND_IMAGE}:${DOCKER_TAG}'
          sh 'docker push ${BACKEND_IMAGE}:latest'
        }
      }
    }

    stage('Deploy') {
      steps {
        dir('terraform') {
          sh 'terraform init'
          sh 'terraform apply -auto-approve -var="namespace=${KUBE_NAMESPACE}"'
        }
        dir('ansible') {
          sh 'ansible-playbook -i inventory playbook.yml'
        }
        sh 'kubectl apply -f k8s/deployment.yaml'
        sh 'kubectl apply -f k8s/service.yaml'
        sh 'kubectl apply -f k8s/backend-deployment.yaml'
        sh 'kubectl apply -f k8s/backend-service.yaml'
        sh 'kubectl set image -n ${KUBE_NAMESPACE} deployment/todo-list todo-list=${FRONTEND_IMAGE}:${DOCKER_TAG}'
        sh 'kubectl set image -n ${KUBE_NAMESPACE} deployment/todo-backend todo-backend=${BACKEND_IMAGE}:${DOCKER_TAG}'
        sh 'kubectl rollout status -n ${KUBE_NAMESPACE} deployment/todo-list'
        sh 'kubectl rollout status -n ${KUBE_NAMESPACE} deployment/todo-backend'
      }
    }
  }

  post {
    always {
      sh 'docker logout || true'
    }
  }
}
