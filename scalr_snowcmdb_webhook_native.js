(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	var authkey = 'xxxxx';
	var scalr_sig = request.getHeader('X-Signature');
	var scalr_date = request.getHeader('Date');
	var scalr_gdate = new GlideDate();
	scalr_gdate.setValue(convertDateToGDT(scalr_date));
	var scalr_gtime = new GlideTime();
	scalr_gtime.setValue(scalr_date.substring(16, scalr_date.length-4));
	var scalr_hour = scalr_gtime.getHourOfDayUTC();
	var scalr_min = scalr_gtime.getMinutesUTC();

	if (scalr_hour.length < 2) {
		scalr_hour = '0' + scalr_hour;
	}
	if (scalr_min.length < 2) {
		scalr_min = '0' + scalr_min;
	}
	var gdt = new GlideDateTime();	
	var scalr_gdt = new GlideDateTime(scalr_gdate.getByFormat('yyyy-MM-dd') + " " + scalr_hour + ':' + scalr_min + ':' + scalr_gtime.getSeconds()); 
	var diff = new GlideDuration();
	diff = GlideDateTime.subtract(scalr_gdt, gdt);
	if(diff.getNumericValue()/1000 > 300){
		return 403;
	}

	gs.info('running.....');
	info = request.body.dataString;
	var data = info + scalr_date;
	
	var signature = new CryptoJS.HmacSHA1(data, authkey);

	if(scalr_sig != signature) {
		gs.info("Signature Mismatch");
		return 403;
	}
	update(info);
})(request, response);

function update(info) {
	var parsed = new global.JSON().decode(info);
	var gr = new GlideRecord('SCALR_SERVER_TABLE_NAME');
	
	gr.initialize();
	if (parsed.eventName != "HostUp") {
		gr.get('SCALR_SERVER_ID_COLUMN', parsed.data.SCALR_SERVER_ID);
	}
	else {
		gr.u_id = parsed.data.SCALR_SERVER_ID;
	}
	gr.status = parsed.eventName;
	gr.environment_id = parsed.data.SCALR_ENV_ID;
	gr.account_id = parsed.data.SCALR_ACCOUNT_ID;
	gr.cloud_platform = parsed.data.SCALR_CLOUD_PLATFORM;
	gr.cloud_location = parsed.data.SCALR_CLOUD_LOCATION;
	gr.farm_role_alias = parsed.data.SCALR_FARM_ROLE_ALIAS;
	gr.farm_role_id = parsed.data.SCALR_FARM_ROLE_ID;
	gr.hostname = parsed.data.SCALR_SERVER_HOSTNAME;
	gr.public_ip = parsed.data.SCALR_EXTERNAL_IP;
	gr.private_ip = parsed.data.SCALR_INTERNAL_IP;
	gr.instance_type = parsed.data.SCALR_SERVER_TYPE;
	gr.farm = parsed.data.SCALR_FARM_NAME;
	if (parsed.eventName == "HostUp"){
		gs.info("Inserting: " + parsed.data.SCALR_SERVER_ID);
		gr.insert();
	}
	else {
		gs.info("Updating: " + parsed.data.SCALR_SERVER_ID);
		gr.update();
	}
}

function convertDateToGDT(scalr_date) {
	var scalr_fmt_date = '';
	switch(scalr_date.substring(7,10)) {
		case 'Jan':
			scalr_fmt_date = scalr_date.substring(11,15) + '-01-' + scalr_date.substring(4,6);
			break;
		case 'Feb':
			scalr_fmt_date = scalr_date.substring(11,15) + '-02-' + scalr_date.substring(4,6);
			break;
		case 'Mar':
			scalr_fmt_date = scalr_date.substring(11,15) + '-03-' + scalr_date.substring(4,6);
			break;
		case 'Apr':
			scalr_fmt_date = scalr_date.substring(11,15) + '-04-' + scalr_date.substring(4,6);
			break;
		case 'May':
			scalr_fmt_date = scalr_date.substring(11,15) + '-05-' + scalr_date.substring(4,6);
			break;
		case 'Jun':
			scalr_fmt_date = scalr_date.substring(11,15) + '-06-' + scalr_date.substring(4,6);
			break;
		case 'Jul':
			scalr_fmt_date = scalr_date.substring(11,15) + '-07-' + scalr_date.substring(4,6);
			break;
		case 'Aug':
			scalr_fmt_date = scalr_date.substring(11,15) + '-08-' + scalr_date.substring(4,6);
			break;			
		case 'Sep':
			scalr_fmt_date = scalr_date.substring(11,15) + '-09-' + scalr_date.substring(4,6);
			break;
		case 'Oct':
			scalr_fmt_date = scalr_date.substring(11,15) + '-10-' + scalr_date.substring(4,6);
			break;
		case 'Nov':
			scalr_fmt_date = scalr_date.substring(11,15) + '-11-' + scalr_date.substring(4,6);
			break;
		case 'Dec':
			scalr_fmt_date = scalr_date.substring(11,15) + '-12-' + scalr_date.substring(4,6);
			break;
		default:
			break;
	}
	return scalr_fmt_date;
}
