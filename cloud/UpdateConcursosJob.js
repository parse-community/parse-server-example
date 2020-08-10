Parse.Cloud.job("updateConcursosJob", async (request) =>{
	console.log("JOB_CONCURSOS | 1. Iniciando o job para atualizar o resultado dos concursos");

	const JobSetting = Parse.Object.extend("JobSetting");
	const query = new Parse.Query(JobSetting);

	console.log("JOB_CONCURSOS | 2. Buscando as configurações ativas...");
	query.equalTo("ativo", true);
	const settings = await query.find({useMasterKey: true});

	console.log(`JOB_CONCURSOS | 3. Configurações encontradas: ${JSON.stringify(settings)}`);

	settings.forEach(setting => {
      console.log('JOB_CONCURSOS | 4. Configuração: ' + JSON.stringify(setting));

	Parse.Cloud.httpRequest({
		url: setting.get("url"),
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		params: {
			"token": setting.get("token"),
			"loteria": setting.get("loteria"),
			"concurso": setting.get("concurso_atual")
		}
		}).then(function(httpResponse) {
			console.log("JOB_CONCURSOS | 5. Sucesso na requisção. Dados da loteria: " + JSON.stringify(httpResponse.data));
			
			processResult(httpResponse.data, setting);
		},function(httpResponse) {
			console.error("JOB_CONCURSOS | 5. Erro na requição: " + JSON.stringify(httpResponse));
			
			setting.set("error", httpResponse.text);
			setting.save();
		});
 	});
	
	console.log("JOB_CONCURSOS | 9. finalizando o job de concursos");

	return ("Concursos atualizados com sucesso"); 
});

async function processResult (bean, setting) {
	const numeroConcurso = parseInt(bean["numero_concurso"]);

	const Concurso = Parse.Object.extend("Concurso");
	
	const query = new Parse.Query(Concurso);
	query.equalTo("loteria", setting.get("loteria"));
	query.equalTo("numero_concurso", numeroConcurso);

	const concursoDB = await query.first();
	
	const isToSave = concursoDB == undefined 
	|| (concursoDB.get("em_processamento") && !bean["rateio_processamento"]);

	console.log(`JOB_CONCURSOS | 6. concurso do banco: ${JSON.stringify(concursoDB)} | isToSave: ${isToSave}`);
	
	if (isToSave) 
		saveConcurso(bean, setting);
}

function saveConcurso(bean, setting){
	const Concurso = Parse.Object.extend("Concurso");
    const concurso = new Concurso();
    
    concurso.set("loteria", setting.get("loteria"));
    concurso.set("nome", bean["nome"]);
    concurso.set("numero_concurso", bean["numero_concurso"]);
    concurso.set("data_concurso", bean["data_concurso"]);
    concurso.set("data_concurso_milliseconds", bean["data_concurso_milliseconds"]);
    concurso.set("local_realizacao", bean["local_realizacao"]);
    concurso.set("rateio_processamento", bean["rateio_processamento"]);
    concurso.set("acumulou", bean["acumulou"]);
    concurso.set("valor_acumulado", bean["valor_acumulado"]);
    concurso.set("dezenas", bean["dezenas"]);
    concurso.set("premiacao", bean["premiacao"]);
    concurso.set("local_ganhadores", bean["local_ganhadores"]);
    concurso.set("arrecadacao_total", bean["arrecadacao_total"]);
    concurso.set("concurso_proximo", bean["concurso_proximo"]);
    concurso.set("data_proximo_concurso", bean["data_proximo_concurso"]);
    concurso.set("data_proximo_concurso_milliseconds", bean["data_proximo_concurso_milliseconds"]);
    concurso.set("valor_estimado_proximo_concurso", bean["valor_estimado_proximo_concurso"]);
    concurso.set("valor_acumulado_especial", bean["valor_acumulado_especial"]);
    concurso.set("nome_acumulado_especial", bean["nome_acumulado_especial"]);
    concurso.set("concurso_especial", bean["concurso_especial"]);

	console.log("JOB_CONCURSOS | 7. Salvando dados no banco: " + JSON.stringify(concurso));

	concurso.save()
	.then((concursoSaved) => {
		console.log("JOB_CONCURSOS | 8. Salvo com sucesso | ID: " + concursoSaved.get("objectId"));
		
		setting.increment("concurso_atual");
		setting.set("error", "");
		setting.save();
	}, (error) => {
		console.log("JOB_CONCURSOS | 8. Erro ao tentar salvar concurso | Error: " + error);
	});
}