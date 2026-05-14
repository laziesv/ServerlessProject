pipeline {
  agent any

  parameters {
    booleanParam(name: 'SKIP_DOCKER_PUSH', defaultValue: false)
    booleanParam(name: 'SKIP_DEPLOY', defaultValue: false)
  }

  environment {
    FRONTEND_DIR = 'frontend'
    BACKEND_DIR = 'backend'

    FRONTEND_IMAGE = 'laziesv/todo-list-frontend'
    BACKEND_IMAGE = 'laziesv/todo-list-backend'

    KUBE_NAMESPACE = 'todo-list'
    DOCKER_TAG = "${BUILD_NUMBER}"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build') {
      steps {
        dir("${FRONTEND_DIR}") {
          sh 'npm ci'
          sh 'npm run build'
        }

        dir("${BACKEND_DIR}") {
          sh 'go build ./...'
        }
      }
    }

    stage('Test') {
      steps {
        dir("${FRONTEND_DIR}") {
          sh 'npm run lint || true'
        }

        dir("${BACKEND_DIR}") {
          sh 'go test ./...'
        }
      }
    }

    stage('Docker Build') {
      steps {
        sh """
          docker build -t ${FRONTEND_IMAGE}:${DOCKER_TAG} -t ${FRONTEND_IMAGE}:latest ./frontend
          docker build -t ${BACKEND_IMAGE}:${DOCKER_TAG} -t ${BACKEND_IMAGE}:latest ./backend
        """
      }
    }

    stage('Push') {
      when {
        expression { return !params.SKIP_DOCKER_PUSH }
      }
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-credentials',
          usernameVariable: 'USER',
          passwordVariable: 'PASS'
        )]) {
          sh """
            echo "$PASS" | docker login -u "$USER" --password-stdin
            docker push ${FRONTEND_IMAGE}:${DOCKER_TAG}
            docker push ${BACKEND_IMAGE}:${DOCKER_TAG}
          """
        }
      }
    }

    stage('Deploy') {
      when {
        expression { return !params.SKIP_DEPLOY }
      }
      steps {

        sh "kubectl apply -f k8s/deployment.yaml"
        sh "kubectl apply -f k8s/service.yaml"

        sh "kubectl apply -f k8s/backend-deployment.yaml"
        sh "kubectl apply -f k8s/backend-service.yaml"

        sh "kubectl set image deployment/todo-list todo-list=${FRONTEND_IMAGE}:${DOCKER_TAG} -n ${KUBE_NAMESPACE}"
        sh "kubectl set image deployment/todo-backend todo-backend=${BACKEND_IMAGE}:${DOCKER_TAG} -n ${KUBE_NAMESPACE}"

        sh "kubectl rollout status deployment/todo-list -n ${KUBE_NAMESPACE}"
        sh "kubectl rollout status deployment/todo-backend -n ${KUBE_NAMESPACE}"
      }
    }
  }

  post {
    always {
      sh 'docker logout || true'
    }
  }
}
