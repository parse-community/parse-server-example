#!/bin/bash
#
# Usage: ./deploy ${env}
#

# Variables
environments="prd dev"

package_docker()
{
    local environment="${1}"

    # Login
    $(aws ecr get-login --region ap-southeast-2 --no-include-email)

    # Build
    docker build -t "ecr-repo-parse-server-${environment}" .

    # Tag
    docker tag "ecr-repo-parse-server-${environment}:latest" \
        "998914283275.dkr.ecr.ap-southeast-2.amazonaws.com/ecr-repo-parse-server-${environment}:latest"

    # Push
    docker push "998914283275.dkr.ecr.ap-southeast-2.amazonaws.com/ecr-repo-parse-server-${environment}:latest"

}

main() 
{
    local environment="${1}"

    # Check if the envionment exists
    [[ "${environments}" =~ (^|[[:space:]])"${environment}"($|[[:space:]]) ]] \
        && echo "Deploying to environment ${environment}" || exit 1

    # Build Docker
    package_docker "${environment}"
    
    # Force new deployment
    aws ecs update-service --cluster "aam-ecs-cluster-parse-server-${environment}" \
        --service xxx \
        --force-new-deployment 

    # Wait for deployment to finish
    aws ecs wait services-stable \
        --cluster "aam-ecs-cluster-parse-server-${environment}" \
        --services xxx
}

main "$@"