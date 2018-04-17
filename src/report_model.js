
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
	constructor(title, hierarquy, license){
		this.title = title
		this.hierarquy = hierarquy
		this.license = license
		this.vulnerabilities = []
	}
}

module.exports.Vulnerability = class Vulnerability {
	constructor(vulnerability_title, module_title, description, recommendation, references, cvss_score, versions){
		this.vulnerability_title = vulnerability_title
		this.module_title = module_title
		this.description = description
		this.recommendation = recommendation
		this.references = references
		this.cvss_score = cvss_score
		this.versions = versions
	}
}