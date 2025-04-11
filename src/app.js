/*
###################################################################
#                                                        	      #
#	@description: Script para realizar borrado de artefactos      #
#	              en Nexus 3                                      #
#                                                        	      #
#	@author:        bhernandez               	 	              #
#	@since:         Nov 5, 2024                     	          #
#	@version:	    1.0                              	          #
#                                                                 #
###################################################################
*/

const axios = require('axios');
const URL = 'https://{host}/nexus';
const group = process.env.GROUP.trim();
const repository = process.env.REPOSITORY.trim();
const names = process.env.NAMES.split(',').map(item => item.trim());
const versions = process.env.VERSIONS.split(',').map(item => item.trim());


const printArtifact = (group, name, version) => {
    console.log("---------------------------------------------")
	console.log("-- Artefacto(s) a eliminar")
	console.log("--")
	console.log(`-- Group:      ${group}`)
	console.log(`-- Name:       ${name}`)
	console.log(`-- Version:    ${version}`)
	console.log("--")
    console.log("---------------------------------------------")
}

const CREDENTIALS = {
    headers: {
		'Authorization': `Basic {credential}`,
		'Content-Type': 'application/json'
    }
}

const createUrlGet = (repository , group, name, version) => {
    return `${URL}/service/rest/v1/search?repository=${repository}&group=${group}&name=${name}&version=${version}`
}

const searchArtifact = async (repository, group, names, versions) => {
    const urls = []
    names.forEach((name) => {
        versions.forEach((version) => {
            urls.push(createUrlGet(repository, group, name, version))
            printArtifact(group, name, version)
        })
    })
    const artifactsId = await Promise.all(urls.map(async (url) => {
        const resultRequest = await axios.get(url, CREDENTIALS)
        if (resultRequest.data && resultRequest.data.items && resultRequest.data.items.length > 0 ) {
            return resultRequest.data.items[0].id
        }
    }))
    return artifactsId.filter(element => element !== undefined)
}

const deleteArtifacts = async (repository, group, names, versions) => {
    const artifactsToRemove = await searchArtifact(repository, group, names, versions)
    await Promise.all(artifactsToRemove.map(async (id) => {
        await axios.delete(`${URL}/service/rest/v1/components/${id}`, CREDENTIALS)
    }))
}


deleteArtifacts(repository, group, names, versions)
