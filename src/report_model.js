
module.exports.Report = class Report {
	constructor(id, version, name, description){
		this.id = id
		this.version = version
		this.name = name
		this.description = description
		this.dependencies = []
	}
}

module.exports.Dependency = class Dependency {
	constructor(title, main_version){
		this.title = title
		this.main_version = main_version
		this.private_versions = []
		this.license = []
		this.hierarchy = []
		this.vulnerabilities = []
	}
}
// TODO: i dont have recomendation and cvss_score
module.exports.Vulnerability = class Vulnerability {
	constructor(vulnerability_title, module_title, description, references, versions){
		this.vulnerability_title = vulnerability_title
		this.module_title = module_title
		this.description = description
		this.references = references
		this.affected_version = versions
	}
}

module.exports.License = class License {
	constructor(title){
		this.title = title
		this.origins = []
	}
}