pipeline{

  agent any
  environment {
    version = '1.0'
    DOCKER_IMAGE = "node:20.17.0"
    HOST_TARGET_DIR = "/var/www/zeli8888/planhattan"
    VITE_PLANHATTAN_API_BASE_URL = "https://zeli8888.ddns.net/planhattan/api"
    // APP CONTEXT MUST MATCH THE CONTEXT YOU SET IN VITE.CONFIG.JS
    VITE_REACT_APP_CONTEXT = "/planhattan"
    VITE_GOOGLE_PLACES_API_KEY = credentials('VITE_GOOGLE_PLACES_API_KEY')
    VITE_MAPBOX_TOKEN = credentials('VITE_MAPBOX_TOKEN')
  }

  stages{

    stage('Test and Build') {
      steps {
          dir('my-app') { 
            script {
              sh """
                docker run --rm \
                  --name planhattan-frontend \
                  -v ${WORKSPACE}/my-app:/app \
                  -w /app \
                  -e VITE_PLANHATTAN_API_BASE_URL="$VITE_PLANHATTAN_API_BASE_URL" \
                  -e VITE_REACT_APP_CONTEXT="$VITE_REACT_APP_CONTEXT" \
                  -e VITE_GOOGLE_PLACES_API_KEY="$VITE_GOOGLE_PLACES_API_KEY" \
                  -e VITE_MAPBOX_TOKEN="$VITE_MAPBOX_TOKEN" \
                  ${DOCKER_IMAGE} \
                  sh -c 'npm ci && npm run build'
              """
            }
          }
      }
    }

    stage('Deploy') {
      steps {
        script {
          sh "mkdir -p ${HOST_TARGET_DIR}"
          
          sh "cp -rf ${WORKSPACE}/my-app/dist/* ${HOST_TARGET_DIR}/"
        }
      }
    }
  }
}
