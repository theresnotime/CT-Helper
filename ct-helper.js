/* Bellezzasolo's ARBCOM discretionary sanctions notifier
If this script does not work, please check skin support and/or install Twinkle

Forked from User:Bellezzasolo/Scripts/arb.js, barely works with contentious topics,
wouldn't recommend using it at the moment..
*/
// This script requires Twinkle < https://en.wikipedia.org/wiki/Wikipedia:Twinkle > to be installed. It is derived from the twinkle unlink module < https://en.wikipedia.org/wiki/MediaWiki:Gadget-twinkleunlink.js >, available under CC BY-SA 3.0 License < https://en.wikipedia.org/wiki/Wikipedia:Text_of_Creative_Commons_Attribution-ShareAlike_3.0_Unported_License > and the GFDL < https://en.wikipedia.org/wiki/Wikipedia:Text_of_the_GNU_Free_Documentation_License >
////////////////////////
//<pre><nowiki>
//<nowiki>
/*
 ****************************************
 *** arb.js: Arbcom Requests Buddy Module
 ****************************************
 * Mode of invocation:     Tab ("ARB")
 * Active on:              Existing user talk pages
 * Config directives in:   FriendlyConfig
 */
 
//Non-Interface stuff, no need for Twinkle
var Arb = {};

Arb.loadDsSanctions = function(){
	//Arb.topic_wikitext;
	//Load DS sanction list
	return new Promise(function(resolve, reject){
	var listoftopicstitle = "Template:Contentious topics/list";
	var query = {
		action: 'query',
		titles: listoftopicstitle,
		prop: 'revisions',
		rvprop: 'content',
		rvlimit: '1'
	};
	Arb.api.get(query).then(function(apiobj){
		Arb.topic_wikitext = apiobj.query.pages[Object.keys(apiobj.query.pages)[0]].revisions[0]['*'];
		Arb.populateDsSanctions();
		resolve();
		return;
	}).catch(function(){reject()});
	});
};

Arb.populateDsSanctions = function () {
	//Populate this list from the arbcom list
	var expression = /(\|+.{1,6}=)/g;
	var results = Arb.topic_wikitext.match(expression);
	Arb.dslist = [];
	var checkset = true;
	var pairs = new Map();
	for (var result in results)
	{
		regexstr = "\\"+results[result]+".+";
		expression = new RegExp(regexstr, "g");
		var answers = Arb.topic_wikitext.match(expression);
		var answer = answers[0];
		answer = answer.replace(results[result], "");
		//Remove wikilinks. They don't work.
		answer = answer.replace(/\[\[.*\|/g, "");
		answer = answer.replace(/\[\[/g, "");
		answer = answer.replace(/\]\]/g, "");
		answer = answer.charAt(0).toUpperCase() + answer.slice(1);	//Uppercase first character
		var code = results[result];
		code = code.replace('|', '');
		code = code.replace('=', '');
		if (!pairs.has(code))
		{
		if(checkset)
		{
			Arb.dslist.push({type: "option", label:answer, value:code, selected: "true"});
			checkset = false;
		}
		else
		{
			Arb.dslist.push({type: "option", label:answer, value:code});
		}
		pairs.set(code, answer);
		}
	}
};

Arb.loadGsSanctions = function(){
	//Arb.topic_wikitext;
	//Load DS sanction list
	return new Promise(function(resolve, reject){
	var listoftopicstitle = "User:Bellezzasolo/Scripts/arb/gstopics";
	var query = {
		action: 'query',
		titles: listoftopicstitle,
		prop: 'revisions',
		rvprop: 'content',
		rvlimit: '1'
	};
	Arb.api.get(query).then(function(apiobj){
		Arb.gs_wikitext = apiobj.query.pages[Object.keys(apiobj.query.pages)[0]].revisions[0]['*'];
		Arb.populateGsSanctions();
		resolve();
	}).catch(function(){reject()});
	});
};

Arb.populateGsSanctions = function () {
	//Populate this list from the arbcom list
	var expression = /(\|+.{1,6}=)/g;
	var results = Arb.gs_wikitext.match(expression);
	Arb.gslist = [];
	var checkset = true;
	var pairs = new Map();
	for (var resultg in results)
	{
		regexstr = "\\"+results[resultg]+".+";
		expression = new RegExp(regexstr, "g");
		var answersg = Arb.gs_wikitext.match(expression);
		var answerg = answersg[0];
		answerg = answerg.replace(results[resultg], "");
		//Remove wikilinks. They don't work.
		answerg = answerg.replace(/\[\[.*\|/g, "");
		answerg = answerg.replace(/\[\[/g, "");
		answerg = answerg.replace(/\]\]/g, "");
		answerg = answerg.charAt(0).toUpperCase() + answerg.slice(1);	//Uppercase first character
		var codeg = results[resultg];
		codeg = codeg.replace('|', '');
		codeg = codeg.replace('=', '');
		if (!pairs.has(answerg))
		{
		if(checkset)
		{
			Arb.gslist.push({type: "option", label:answerg, value:codeg, selected: "true"});
			checkset = false;
		}
		else
		{
			Arb.gslist.push({type: "option", label:answerg, value:codeg});
		}
		pairs.set(answerg, codeg);
		}
	}
};

Arb.arb = function()
{
	return new Promise(function(resolve, reject){
		mw.loader.using(['mediawiki.api', 'mediawiki.util']).then(function()
		{
			var api = new mw.Api({ajax: {
		        headers: { 'Api-User-Agent': 'Arb/Bellezzasolo/3.1.2' }
		    }});
			Arb.api = api;
			var p1 = Arb.loadDsSanctions();
			var p2 = Arb.loadGsSanctions();
			p1.then(function(){p2.then(function(){resolve()})});
			p1.catch(function(){reject()});
			p2.catch(function(){reject()});
		});
	});
};
Arb.promise = Arb.arb();

//This needs Twinkle
mw.loader.using(['ext.gadget.Twinkle', 'mediawiki.api']).then(function(){
Arb.promise.then(function(){
//jQuery, when the DOM is ready
(function($){
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

Twinkle.arb = function() {

	if ( !mw.config.get('wgRelevantUserName') ) {
		return;
	}

	Twinkle.addPortletLink( Twinkle.arb.callback, "ARB", "ds-notify", "ARBCOM Requests Buddy" );
};

Twinkle.arb.callback = function( ) {
	if( mw.config.get('wgRelevantUserName') === mw.config.get("wgUserName") && !confirm("Is it really so bad that you're notifiying yourself?") ){
		return;
	}

	var Window = new Morebits.simpleWindow( 600, 350 );
	//Ugly hack to disable scrollbar
	$(Window.content).css('overflow-x', 'hidden'); 
	Window.setTitle("Arbritration Requests Buddy");
	Window.setScriptName("Twinkle+");
	Window.addFooterLink( "About Discretionary Sanctions", "Wikipedia:Arbitration Committee/Discretionary sanctions" );
	Window.addFooterLink( "ARB v3.1 help", "User:Bellezzasolo/Scripts/arb" );
	Window.addFooterLink( '\u2230Bellezzasolo\u2721', "User talk:Bellezzasolo" );
	var form = new Morebits.quickForm( Twinkle.arb.callback.evaluate );
	//Offer global options
	var thelist = [
			{
				label: "Discretionary Sanctions Notice",
				value: "ds",
				checked: "true"
			},
			{
				label: "General Sanctions Notice",
				value: "gs"
			}
		];
	//If the user is an administrator, show blocking options. Also, if the user is me, because I have to test this!
	if ( Morebits.userIsInGroup('sysop') || mw.config.get("wgUserName") == "Bellezzasolo")
	{
		thelist = thelist.concat([
			{
				label: "Arbitration Sanction",
				value: "aesanction"
			}
			]);
		thelist = thelist.concat([
			{
				label: "Arbitration Block",
				value: "dsblock"
			}
			]);
		thelist = thelist.concat([
			{
				label: "General Block",
				value: "block"
			}
			]);
		Twinkle.arb.fetchUserInfo();
	}
	
	//Now display the options
	var actionfield = form.append({ type: "field", label:"Action"});
	actionfield.append({ type: "radio", name: "action",
	list: thelist,
		event: Twinkle.arb.callback.change_action
	});
	actionfield.append({
		type: "div",
		label: "",
		style: "a{color: green; font-weight:bold}",
		id: "arb-list-loaded"
	});

	form.append({
			type: "field",
			label: "Discretionary Sanctions",
			name: "field_dswarn"
		});
	form.append({
			type: "field",
			label: "General Sanctions",
			name: "field_gswarn"
		});
	form.append({
			type: "field",
			label: "Arbitration Sanction",
			name: "field_aesanction"
		});
	form.append({
			type: "field",
			label: "Block Options",
			name: "field_block"
		});
	form.append({
			type: "field",
			label: "Block Template Options",
			name: "field_template"
		});

	form.append({ type: "submit" });

	var result = form.render();
	Window.setContent( result );
	Window.display();
	result.root = result;

	// We must init the
	var evt = document.createEvent("Event");
	evt.initEvent( "change", true, true );
	result.action[0].dispatchEvent( evt );
	var datenow = new Date();
	var yearago = new Date();
	yearago.setFullYear(yearago.getFullYear() -1);
	var query = {
		action: 'query',
		list: 'abuselog',
		afltitle: mw.config.get("wgFormattedNamespaces")[ mw.config.get("wgNamespaceIds").user_talk ] + ":" + mw.config.get('wgRelevantUserName'),
		aflfilter: 602,
		aflstart: yearago.toISOString(),
		aflend: datenow.toISOString(),
		aflprop: "details|revid",
		afldir: "newer",
		afllimit: 300,
	};
	Arb.api.get(query).then(Twinkle.arb.callback.dsnotices);
};

Twinkle.arb.dsprev = new Map();
Twinkle.arb.gsprev = new Map();

Twinkle.arb.fetchUserInfo = function twinklearbFetchUserInfo(fn) {

	Arb.api.get({
		format: 'json',
		action: 'query',
		list: 'blocks|users|logevents',
		letype: 'block',
		lelimit: 1,
		bkusers: mw.config.get('wgRelevantUserName'),
		ususers: mw.config.get('wgRelevantUserName'),
		letitle: 'User:' + mw.config.get('wgRelevantUserName')
	})
	.then(function(data){
		var blockinfo = data.query.blocks[0],
			userinfo = data.query.users[0];

		Twinkle.arb.isRegistered = !!userinfo.userid;
		relevantUserName = Twinkle.arb.isRegistered ? 'User:' + mw.config.get('wgRelevantUserName') : mw.config.get('wgRelevantUserName');

		if (blockinfo) {
			// handle frustrating system of inverted boolean values
			blockinfo.disabletalk = blockinfo.allowusertalk === undefined;
			blockinfo.hardblock = blockinfo.anononly === undefined;
			Twinkle.arb.currentBlockInfo = blockinfo;
		}

		Twinkle.arb.hasBlockLog = !!data.query.logevents.length;

		if (typeof fn === 'function') return fn();
	}, function(msg) {
		Morebits.status.init($('div[name="currentblock"] span').last()[0]);
		Morebits.status.warn('Error fetching user info', msg);
	});
};

Twinkle.arb.callback.saveFieldset = function twinklearbCallbacksaveFieldset(fieldset) {
	Twinkle.arb[$(fieldset).prop('name')] = {};
	$(fieldset).serializeArray().forEach(function(el) {
		Twinkle.arb[$(fieldset).prop('name')][el.name] = el.value;
	});
};

Twinkle.arb.callback.dsnotices = function(apiobj) {
	for (var entry in apiobj.query.abuselog)
	{
		var diff = apiobj.query.abuselog[entry].details.edit_diff;
		try {
		var codes = diff.match(/alert\|.{1,4}}}+/g);
		}
		catch(e){console.log("No Diff");continue;};		//If this was a warning, not an edit
		for (var code in codes)
		{
			var thecode = codes[code].replace('}}', '');
			thecode = thecode.replace('alert|', '');
			if(!Twinkle.arb.dsprev.has(thecode))
			{
				Twinkle.arb.dsprev.set(thecode, apiobj.query.abuselog[entry].revid);
			}
			else if(apiobj.query.abuselog[entry].revid && !Twinkle.arb.dsprev.get(thecode))
			{
				Twinkle.arb.dsprev.set(thecode, apiobj.query.abuselog[entry].revid);
			}
		}
	}
	var $status = $("#arb-list-loaded");
	$status.text("Sanctions list loaded").attr('style', 'color:green');
};

Twinkle.arb.callback.dscontribs = function(apiobj) {
	//;Sanction or remedy to be enforced: [[Wikipedia:Requests for arbitration/India-Pakistan#Standard discretionary sanctions]]
	
};

Twinkle.arb.optout = false;

var prev_gs;
var prev_ds;

Twinkle.arb.callback.change_action = function( e ) {
	var field_dswarn, field_gswarn, field_block, field_aesanction, field_template, $form = $(e.target.form);
	
	Twinkle.arb.callback.saveFieldset($('[name=field_aesanction]'));
	Twinkle.arb.callback.saveFieldset($('[name=field_block]'));
	Twinkle.arb.callback.saveFieldset($('[name=field_dswarn]'));
	Twinkle.arb.callback.saveFieldset($('[name=field_gswarn]'));
	Twinkle.arb.callback.saveFieldset($('[name=field_template]'));
	
	var value = e.target.values;
	var root = e.target.form;
	if(value == "dsblock") {
		field_block = new Morebits.quickForm.element({ type: 'field', label: 'Block options', name: 'field_block' });
		field_template = new Morebits.quickForm.element({ type: 'field', label: 'Block Template options', name: 'field_template' });
		field_block.append({ type: 'div', name: 'hasblocklog', label: ' ' });
		field_block.append({ type: 'div', name: 'currentblock', label: ' ' });
		field_block.append({
			type: 'select',
			name: 'expiry_preset',
			label: 'Expiry:',
			event: Twinkle.arb.callback.change_expiry,
			list: [
				{ label: 'custom', value: 'custom', selected: true},
				{ label: 'indefinite', value: 'infinity' },
				{ label: '3 hours', value: '3 hours' },
				{ label: '12 hours', value: '12 hours' },
				{ label: '24 hours', value: '24 hours' },
				{ label: '31 hours', value: '31 hours' },
				{ label: '36 hours', value: '36 hours' },
				{ label: '48 hours', value: '48 hours' },
				{ label: '60 hours', value: '60 hours' },
				{ label: '72 hours', value: '72 hours'},
				{ label: '1 week', value: '1 week' },
				{ label: '2 weeks', value: '2 weeks' },
				{ label: '1 month', value: '1 month' },
				{ label: '3 months', value: '3 months' },
				{ label: '6 months', value: '6 months' },
				{ label: '1 year', value: '1 year' },
				{ label: '2 years', value: '2 years' },
				{ label: '3 years', value: '3 years' }
			]
		});
		field_block.append({
				type: 'input',
				name: 'expiry',
				label: 'Custom expiry',
				tooltip: 'You can use relative times, like "1 minute" or "19 days", or absolute timestamps, "yyyymmddhhmm" (e.g. "200602011405" is Feb 1, 2006, at 14:05 UTC).',
				value: Twinkle.arb.field_block.expiry
		});
		var blockoptions = [
			{
				checked: true,
				label: 'Block account creation',
				name: 'nocreate',
				value: '1'
			},
			{
				label: 'Block user from sending email',
				name: 'noemail',
				value: '1'
			},
			{
				label: 'Prevent this user from editing their own talk page while blocked',
				name: 'disabletalk',
				value: '1'
			}
		];

		if (Twinkle.arb.isRegistered) {
			blockoptions.push({
					checked: true,
					label: 'Autoblock any IP addresses used (hardblock)',
					name: 'autoblock',
					value: '1'
				});
		} else {
			blockoptions.push({
					checked: true,
					label: 'Prevent logged-in users from editing from this IP address (hardblock)',
					name: 'hardblock',
					value: '1'
				});
		}

		blockoptions.push({
				label: 'Watch user and user talk pages',
				name: 'watchuser',
				value: '1'
			});

		field_block.append({
				type: 'checkbox',
				name: 'blockoptions',
				list: blockoptions
			});
		field_block.append({
			type: 'textarea',
			label: 'Reason (for block log):',
			name: 'logreason',
			value: "Arbritration Enforcement"
		});
		if (Twinkle.arb.currentBlockInfo) {
			field_block.append( { type: 'hidden', name: 'reblock', value: '1' } );
		}
		field_template.append( {
				type: 'select',
				name: 'sanction',
				label: 'Choose sanction area:',
				style: "max-width:30%;",
				list: Arb.dslist
		} );
		field_template.append( {
				type: 'input',
				name: 'article',
				display: 'none',
				label: 'Linked article',
				value: '',
				tooltip: 'An article can be linked within the notice, perhaps if it was the primary target of disruption. Leave empty for no article to be linked.'
			} );
		field_template.append( {
			type: 'input',
			name: 'block_reason',
			label: '"You have been blocked for ..." ',
			display: 'none',
			tooltip: 'An optional reason, to replace the default generic reason. Only available for the generic block templates.',
			value: Twinkle.arb.field_template.block_reason
		} );

		field_template.append( {
			type: 'checkbox',
			name: 'blank_duration',
			list: [
				{
					label: 'Do not include expiry in template',
					checked: Twinkle.arb.field_template.blank_duration,
					tooltip: 'Instead of including the duration, make the block template read "You have been blocked from editing temporarily for..."'
				}
			]
		} );

		var $previewlink = $( '<a id="twinklearbblock-preview-link">Preview</a>' );
		$previewlink.off('click').on('click', function(){
			Twinkle.arb.callback.preview($form[0]);
		});
		$previewlink.css({cursor: 'pointer'});
		field_template.append( { type: 'div', id: 'arbblockpreview', label: [ $previewlink[0] ] } );
		field_template.append( { type: 'div', id: 'twinklearbblock-previewbox', style: 'display: none' } );
	}
	else if(value == "block")
	{
		Twinkle.block.callback();
	}
	else if(value == "aesanction")
	{
		field_aesanction = new Morebits.quickForm.element({ type: 'field', label: 'Arbitration Sanction', name: 'field_aesanction' });
		field_aesanction.append({
				type: "div",
				label: "",
				style: "a{color: red; font-weight:bold}",
				id: "arb-already-notified"
			});
		field_aesanction.append( {
			type: 'textarea',
			name: 'sanctions',
			label: 'Sanction',
			display: 'none',
			tooltip: 'The sanction that you are applying to the user',
			value: Twinkle.arb.field_aesanction.sanction
		} );
		field_aesanction.append( {
			type: 'textarea',
			name: 'rationale',
			label: 'Rationale',
			display: 'none',
			tooltip: 'The reason for the sanction',
			value: Twinkle.arb.field_aesanction.sanction
		} );
		field_aesanction.append( {
			type: 'input',
			name: 'action',
			label: 'Action',
			display: 'none',
			tooltip: 'The action (for WP:AEL)',
			value: Twinkle.arb.field_aesanction.action
		} );
		var sanctions = field_aesanction.append({
			type: "select",
			name: "sanction",
			label: "Sanction area:",
			style: "max-width:30%;",
			event: Twinkle.arb.callback.change_sanction
		});
		for (var dsl in Arb.dslist)
		{
			sanctions.append(Arb.dslist[dsl]);
		}
		var $previewlink = $( '<a id="twinklesanction-preview-link">Preview</a>' );
		$previewlink.off('click').on('click', function(){
			Twinkle.arb.callback.previewSanction($form[0]);
		});
		$previewlink.css({cursor: 'pointer'});
		field_aesanction.append( { type: 'div', id: 'sanctionpreview', label: [ $previewlink[0] ] } );
		field_aesanction.append( { type: 'div', id: 'twinklesanction-previewbox', style: 'display: none' } );
	}
	else if(value == "gs")
	{
		field_gswarn = new Morebits.quickForm.element({ type: 'field', label: 'General Sanctions Notice', name: 'field_gswarn' });
		field_gswarn.append({
				type: "div",
				label: "",
				style: "a{color: red; font-weight:bold}",
				id: "arb-already-notified"
			});
		var sanctions = field_gswarn.append({
			type: "select",
			name: "sanction",
			label: "Sanctions:",
			style: "max-width:30%;",
			event: Twinkle.arb.callback.change_sanction		//TODO: This might want separating from the DS code path
		});
		for (var gsl in Arb.gslist)
		{
			sanctions.append(Arb.gslist[gsl]);
		}
	}
	else /*if(value == "ds")*/
	{
		field_dswarn = new Morebits.quickForm.element({ type: 'field', label: 'Discretionary Sanctions Notice', name: 'field_dswarn' });
		field_dswarn.append({
				type: "div",
				label: "",
				style: "a{color: red; font-weight:bold}",
				id: "arb-already-notified"
			});
		var notice = field_dswarn.append({
				type: "div",
				label: "",
				style: "a{color: red; font-weight:bold}",
				id: "arb-dsnotify-warning"
			});
		var sanctions = field_dswarn.append({
			type: "select",
			name: "sanction",
			label: "Sanctions:",
			style: "max-width:30%;",
			event: Twinkle.arb.callback.change_sanction
		});
		for (var dsl in Arb.dslist)
		{
			sanctions.append(Arb.dslist[dsl]);
		}
	}
	
	var oldfield;
	if (field_block) {
		oldfield = $form.find('fieldset[name="field_block"]')[0];
		oldfield.parentNode.replaceChild(field_block.render(), oldfield);
	} else {
		$form.find('fieldset[name="field_block"]').hide();
	}
	if (field_aesanction) {
		oldfield = $form.find('fieldset[name="field_aesanction"]')[0];
		oldfield.parentNode.replaceChild(field_aesanction.render(), oldfield);
		e.target.form.root.previewer = new Morebits.wiki.preview($(e.target.form.root).find('#twinklesanction-previewbox').last()[0]);
	} else {
		$form.find('fieldset[name="field_aesanction"]').hide();
	}
	if (field_dswarn) {
		oldfield = $form.find('fieldset[name="field_dswarn"]')[0];
		oldfield.parentNode.replaceChild(field_dswarn.render(), oldfield);
	} else {
		$form.find('fieldset[name="field_dswarn"]').hide();
	}
	if (field_gswarn) {
		oldfield = $form.find('fieldset[name="field_gswarn"]')[0];
		oldfield.parentNode.replaceChild(field_gswarn.render(), oldfield);
	} else {
		$form.find('fieldset[name="field_gswarn"]').hide();
	}
	if (field_template) {
		oldfield = $form.find('fieldset[name="field_template"]')[0];
		oldfield.parentNode.replaceChild(field_template.render(), oldfield);
		e.target.form.root.previewer = new Morebits.wiki.preview($(e.target.form.root).find('#twinklearbblock-previewbox').last()[0]);
	} else {
		$form.find('fieldset[name="field_template"]').hide();
	}

	if (Twinkle.arb.hasBlockLog) {
		var $blockloglink = $( '<a target="_blank" href="' + mw.util.getUrl('Special:Log', {action: 'view', page: mw.config.get('wgRelevantUserName'), type: 'block'}) + '">block log</a>)' );

		Morebits.status.init($('div[name="hasblocklog"] span').last()[0]);
		Morebits.status.warn('This user has been blocked in the past', $blockloglink[0]);
	}

	if (Twinkle.arb.currentBlockInfo) {
		Morebits.status.init($('div[name="currentblock"] span').last()[0]);
		Morebits.status.warn(relevantUserName + ' is already blocked', 'Submit query to reblock with supplied options');
		//Twinkle.arb.callback.update_form(e, Twinkle.arb.currentBlockInfo);
	} 
};

Twinkle.arb.callback.preview = function twinkleblockcallbackPreview(form) {
	var params = {
		article: form.article.value,
		blank_duration: form.blank_duration ? form.blank_duration.checked : false,
		disabletalk: form.disabletalk.checked || (form.notalk ? form.notalk.checked : false),
		expiry: form.template_expiry ? form.template_expiry.value : form.expiry.value,
		hardblock: Twinkle.arb.isRegistered ? form.autoblock.checked : form.hardblock.checked,
		indefinite: (/indef|infinity|never|\*|max/).test( form.template_expiry ? form.template_expiry.value : form.expiry.value ),
		reason: form.block_reason.value,
		template: "uw-aeblock"
	};

	var templateText = Twinkle.arb.callback.getBlockNoticeWikitext(params);

	form.previewer.beginRender(templateText);
};

Twinkle.arb.callback.previewSanction = function twinkleblockcallbackPreviewSanction(form) {
	var params = {
		sanctions: form.sanctions.value,
		rationale: form.rationale.value,
		sanction: form.sanction.value
	};
	var templateText = Twinkle.arb.callback.getSanctionNoticeWikitext(params);

	form.previewer.beginRender(templateText);
};

Twinkle.arb.callback.change_sanction = function( e ) {
	var sanct = e.target.value;
	if(Twinkle.arb.dsprev.has(sanct))
	{
		var diff = Twinkle.arb.dsprev.get(sanct);
		if(typeof diff === 'undefined')
		{
			console.log("Half-complete sanction detected");
			var $status = $("#arb-already-notified");
			$status.html("<span style='color:#cc8800; font-style:italic;'>This user has not been notified of these sanctions</span>");
		}
		else
		{
			var $status = $("#arb-already-notified");
			$status.html("<a href='https://en.wikipedia.org/wiki/Special:Diff/" + diff + 
			"' style='color: red; font-weight:bold;'>This user has been notified of these sanctions</a>");
		}
	}
	else
	{
		var diff = Twinkle.arb.dsprev.get(sanct);
		var $status = $("#arb-already-notified");
		$status.html("<span style='color:green;'>This user has not been notified of these sanctions</span>");
	}
	$("#arb-dsnotify-warning").html("<a href='https://en.wikipedia.org/wiki/MediaWiki:Abusefilter-warning-DS' style='color: red; font-weight:bold;'>Please note the AbuseFilter warning</a>");
	return;
};

Twinkle.arb.callback.change_expiry = function(e) {
	var expiry = e.target.form.expiry;
	if (e.target.value === 'custom') {
		Morebits.quickForm.setElementVisibility(expiry.parentNode, true);
	} else {
		Morebits.quickForm.setElementVisibility(expiry.parentNode, false);
		expiry.value = e.target.value;
	}
};

var enacted_sanction;
var username;

function regexIndexOf(text, re, i) {
    var indexInSuffix = text.slice(i).search(re);
    return indexInSuffix < 0 ? indexInSuffix : indexInSuffix + i;
}

Twinkle.arb.callback.gslog = function( data ) {
	var params = data.getCallbackParameters();
	var username = mw.config.get('wgRelevantUserName');
	data.load(function (data) { 
		var diff = data.getCurrentID();
		//Now log the enforcement action
		var notice_section = new Morebits.date().getUTCFullYear() + " notices";
		//Find the right page
		var regex = new RegExp("\\|"+params.sanction+"=.*", "g");
		var results = Arb.gs_wikitext.match(regex);
		var result = results[2];
		result = result.replace("|" + params.sanction + "=", "");
		var query = {
			action: 'parse',
			page: result,
			prop: 'sections'
		};
		Arb.api.get(query).then(function(apiobj){
			var yearstr = (new Morebits.date()).getUTCFullYear() +" notices";
			var sections = apiobj.parse.sections;
			var matchsects = sections.filter(section => section.line == yearstr);
			var pagetitle = matchsects[Object.keys(matchsects)[0]].fromtitle;
			var logpage = new Morebits.wiki.page(pagetitle, "Logging sanction notice");
			logpage.load(function(lpdata)
			{
				var text = lpdata.getPageText();
				var year_regex = new RegExp("==\\s*"+ (new Morebits.date()).getUTCFullYear() +" notices\\s*==", "g");
				var regex_result = year_regex.exec(text);
				if (regex_result == null)
				{
					mw.util.jsMessage("Could not find section for this year. It may exist as a subpage.");
					return;
				}
				var index_next = regexIndexOf(text,/={2,10}.+={2,10}/g, year_regex.lastIndex);
				var append_string = "*{{user|"+username+"}} {{diff2|"+diff+"|notified here}}. ~~~~\n";
				var result_string = text.slice(0, index_next) + append_string + text.slice(index_next);
				logpage.setPageText(result_string);
				logpage.setEditSummary("Logging GS notification for " + username + Twinkle.getPref('summaryAd'));
				logpage.setFollowRedirect( true );
				logpage.setCreateOption('nocreate');
				logpage.save();
			}
			);
			
		}).catch(function(e){mw.util.jsMessage("Could not find section for this year. It may exist as a subpage.");});
	});
}

Twinkle.arb.callback.dslog = function( data ) {
	var params = data.getCallbackParameters();
	var action = params.action;
	var year = new Morebits.date().getUTCFullYear()
	data.load(function (data) { 
	var diff = data.getCurrentID();
	var username = mw.config.get('wgRelevantUserName');
	var sanction_text = "*{{user|" + username + "}} "+ action + " ";
	if(params.calculate_date)
	{
		sanction_text += (params.indefinite?"indefinitely":"for " + params.expiry);
	}
	sanction_text += " ({{diff2|" + diff + "}}) ~~~~\n";
	//Now log the enforcement action
	var notice_section = new Morebits.date().getUTCFullYear();
	//Find the subsection
	var regex = new RegExp("\\|"+params.sanction+"=.*", "g");
	var results = Arb.topic_wikitext.match(regex);
	var result = results[1];
	result = result.replace("|" + params.sanction + "=", "");
	result = result.replace(/Wikipedia:.*\//, "");
	
	var logpage = new Morebits.wiki.page("Wikipedia:Arbitration enforcement log/" + year, "Logging sanction notice");
	logpage.setFollowRedirect(true);
	logpage.load(function(lpdata)
	{
		var text = lpdata.getPageText();
		var section_regex = new RegExp("==.*\\|"+ result +".*==", "g");
		var regex_result = section_regex.exec(text);
		if (regex_result == null)
		{
			mw.util.jsMessage("Could not find section for this enforcement.");
			sanction_text = "===" + result + "===\n" + sanction_text;
		}
		var index_next = regexIndexOf(text,/={2,10}.+={2,10}/g, section_regex.lastIndex);
		var result_string = text.slice(0, index_next) + sanction_text + text.slice(index_next);
		logpage.setPageText(result_string);
		logpage.setEditSummary("Logging DS sanction for " + username + Twinkle.getPref('summaryAd'));
		logpage.setCreateOption('recreate');
		logpage.save();
	}
	);
	});
}

Twinkle.arb.blockPresetsInfo = {
	'uw-aeblock' : {
		autoblock: true,
		nocreate: true,
		pageParam: true,
		reason: '[[WP:Arbitration enforcement|Arbitration enforcement]]',
		reasonParam: true,
		summary: 'You have been blocked from editing for violating an [[WP:Arbitration|arbitration decision]] with your edits'
	}
}

Twinkle.arb.callback.getSanctionNoticeWikitext = function(params) {
	var text = '{{subst:AE sanction';
	text += '|sanction=' + params.sanctions;
	text += '|rationale=' + params.rationale;
	text += '|decision=' + params.sanction;
	text += '}}';
	return text;
};

Twinkle.arb.callback.getBlockNoticeWikitext = function(params) {
	var text = '{{', settings = Twinkle.arb.blockPresetsInfo[params.template];
	
	if (!settings.nonstandard) {
		text += 'subst:'+params.template;
		if (params.article && settings.pageParam) text += '|page=' + params.article;

		if (!/te?mp|^\s*$|min/.exec(params.expiry)) {
			if (params.indefinite) {
				text += '|indef=yes';
			} else if(!params.blank_duration) {
				text += '|time=' + params.expiry;
			}
		}
		if (!Twinkle.arb.isRegistered && !params.hardblock) {
			text += '|anon=yes';
		}

		if (params.reason) text += '|reason=' + params.reason;
		if (params.sanction) text += "|topic=" + params.sanction;
		if (params.disabletalk) text += '|notalk=yes';
	} else {
		text += params.template;
	}

	if (settings.sig) text += '|sig=' + settings.sig;

	return text + '}}';
};

Twinkle.arb.callback.evaluate = function( e ) {
	var $form = $(e.target);
	var action = e.target.getChecked( "action" )[0];
	var type;
	var blockoptions = {}, dswarnoptions = {}, gswarnoptions = {};
	Twinkle.arb.callback.saveFieldset($form.find('[name=field_block]'));
	Twinkle.arb.callback.saveFieldset($form.find('[name=field_template]'));
	Twinkle.arb.callback.saveFieldset($form.find('[name=field_aesanction]'));
	Twinkle.arb.callback.saveFieldset($form.find('[name=field_dswarn]'));
	Twinkle.arb.callback.saveFieldset($form.find('[name=field_gswarn]'));
	
	blockoptions = Twinkle.arb.field_block;
	templateoptions = Twinkle.arb.field_template;
	sanctionoptions = Twinkle.arb.field_aesanction;
	dswarnoptions = Twinkle.arb.field_dswarn;
	gswarnoptions = Twinkle.arb.field_gswarn;
	
	if(action == "dsblock")
	{
	Morebits.simpleWindow.setButtonsEnabled( false );
	Morebits.status.init( e.target );
	var statusElement = new Morebits.status('Executing block');
	blockoptions.action = 'block';
	blockoptions.user = mw.config.get('wgRelevantUserName');
	
	//Coerce to boolean
	blockoptions.hardblock = !!blockoptions.hardblock;
	blockoptions.disabletalk  = !!blockoptions.disabletalk;
	blockoptions.reason = blockoptions.logreason;
	blockoptions.anononly = blockoptions.hardblock ? undefined : true;
	blockoptions.allowusertalk = blockoptions.disabletalk ? undefined : true;
	
	//Template options
	templateoptions.disabletalk = !!(templateoptions.disabletalk || blockoptions.disabletalk);
	templateoptions.hardblock = !!blockoptions.hardblock;
	delete blockoptions.expiry_preset; // remove extraneous
	
	// use block settings as warn options where not supplied
	templateoptions.summary = templateoptions.summary || blockoptions.logreason;
	templateoptions.expiry = blockoptions.expiry;
	
	//ARBITRATION
	templateoptions.template = "uw-aeblock";
	
	if (blockoptions.expiry === 'infinity') blockoptions.expiry = 'infinite';
	
	Arb.api.getToken('block').then(function(token) {
			statusElement.status('Processing...');
			blockoptions.token = token;
			
			var mbApi = new Morebits.wiki.api( 'Executing block', blockoptions, function() {
				statusElement.info('Completed');
				Twinkle.arb.callback.issue_template(templateoptions);
			});
			mbApi.post();
		}, function() {
			statusElement.error('Unable to fetch block token');
		});
	}
	else if(action == "aesanction")
	{
		text = "\n";
		text += Twinkle.arb.callback.getSanctionNoticeWikitext(sanctionoptions);
		var editsummary = "Adding Arbitration Sanction Notice" + Twinkle.getPref("summaryAd");
		var postparams = $.extend(sanctionoptions, { calculate_date: false});
		Twinkle.arb.callback.issue_warning(e, text, editsummary, Twinkle.arb.callback.dslog, postparams);
	}
	else if(action == "ds")
	{
		type = dswarnoptions.sanction;
		text = "\n{{subst:alert/first|"+type+"}} ~~~~";
		var editsummary = "Adding [[Wikipedia:Contentious topics|Contentious topics]] notice (" + type + ")" + Twinkle.getPref("summaryAd");
		Twinkle.arb.callback.issue_warning(e, text, editsummary, null, null);
	}
	else if(action == "gs") {
		type = gswarnoptions.sanction;
		text = "\n==Important Notice==\n{{subst:Gs/alert|"+type+"}} ~~~~";
		var editsummary = "Adding [[WP:GS|General Sanctions]] Notice (" + type + ")" + Twinkle.getPref("summaryAd");
		var postparams = $.extend(gswarnoptions, { calculate_date: false});
		Twinkle.arb.callback.issue_warning(e, text, editsummary, Twinkle.arb.callback.gslog, postparams);
	}
};
Twinkle.arb.callback.issue_warning = function(e, text, summary, post, postparams) {
	var username = mw.config.get('wgRelevantUserName');
	var fullUserTalkPageName = mw.config.get("wgFormattedNamespaces")[ mw.config.get("wgNamespaceIds").user_talk ] + ":" + mw.config.get('wgRelevantUserName');
	var page = fullUserTalkPageName;
	if( !page ) {
		mw.util.jsMessage("You must specify the username of the user whose talk page you left a message on.");
		return;
	}

	Morebits.simpleWindow.setButtonsEnabled( false );
	Morebits.status.init( e.target );

	Morebits.wiki.actionCompleted.redirect = fullUserTalkPageName;
	Morebits.wiki.actionCompleted.notice = "Notice complete; reloading talk page in a few seconds";
	var talkpage = new Morebits.wiki.page(fullUserTalkPageName, "Adding [[WP:AC/DS|Discretionary Sanctions]] Notice");
	talkpage.setEditSummary(summary);
	talkpage.setAppendText( text );
	talkpage.setCreateOption("recreate");
	talkpage.setMinorEdit(false);
	talkpage.setFollowRedirect( true );
	talkpage.append(post).then(function (){}, function(){ //Will fail due to edit filer
		Morebits.wiki.numberOfActionsLeft = 0;
		talkpage.append(post);
	});
}
Twinkle.arb.callback.issue_template = function( formData ) {
	var userTalkPage = 'User_talk:' + mw.config.get('wgRelevantUserName');

	var params = $.extend(formData, {
		messageData: Twinkle.arb.blockPresetsInfo[formData.template],
		reason: Twinkle.arb.field_template.block_reason,
		disabletalk: Twinkle.arb.field_template.notalk
	});

	Morebits.wiki.actionCompleted.redirect = "Wikipedia:Arbitration enforcement log";
	Morebits.wiki.actionCompleted.notice = 'Actions complete, loading user talk page in a few seconds';

	var wikipedia_page = new Morebits.wiki.page( userTalkPage, 'User talk page modification' );
	wikipedia_page.setCallbackParameters( params );
	wikipedia_page.setFollowRedirect( true );
	wikipedia_page.load( Twinkle.arb.callback.main );
};
Twinkle.arb.callback.main = function twinkleblockcallbackMain( pageobj ) {
	var text = pageobj.getPageText(),
		params = pageobj.getCallbackParameters(),
		messageData = params.messageData,
		date = new Morebits.date();

	var dateHeaderRegex = new RegExp( '^==+\\s*(?:' + date.getUTCMonthName() + '|' + date.getUTCMonthNameAbbrev() +
		')\\s+' + date.getUTCFullYear() + '\\s*==+', 'mg' );
	var dateHeaderRegexLast, dateHeaderRegexResult;
	while ((dateHeaderRegexLast = dateHeaderRegex.exec( text )) !== null) {
		dateHeaderRegexResult = dateHeaderRegexLast;
	}
	// If dateHeaderRegexResult is null then lastHeaderIndex is never checked. If it is not null but
	// \n== is not found, then the date header must be at the very start of the page. lastIndexOf
	// returns -1 in this case, so lastHeaderIndex gets set to 0 as desired.
	var lastHeaderIndex = text.lastIndexOf( '\n==' ) + 1;

	if ( text.length > 0 ) {
		text += '\n\n';
	}

	params.indefinite = (/indef|infinity|never|\*|max/).test( params.expiry );

	if ( Twinkle.getPref('blankTalkpageOnIndefBlock') && params.template !== 'uw-lblock' && params.indefinite ) {
		Morebits.status.info( 'Info', 'Blanking talk page per preferences and creating a new level 2 heading for the date' );
		text = '== ' + date.getUTCMonthName() + ' ' + date.getUTCFullYear() + ' ==\n';
	} else if( !dateHeaderRegexResult || dateHeaderRegexResult.index !== lastHeaderIndex ) {
		Morebits.status.info( 'Info', 'Will create a new level 2 heading for the date, as none was found for this month' );
		text += '== ' + date.getUTCMonthName() + ' ' + date.getUTCFullYear() + ' ==\n';
	}

	params.expiry = typeof params.template_expiry !== "undefined" ? params.template_expiry : params.expiry;
	
	text += Twinkle.arb.callback.getBlockNoticeWikitext(params);
	
	// build the edit summary
	var summary = messageData.summary;
	
	if ( messageData.suppressArticleInSummary !== true && params.article ) {
		summary += ' on [[:' + params.article + ']]';
	}
	summary += '.' + Twinkle.getPref('summaryAd');

	pageobj.setPageText( text );
	pageobj.setEditSummary( summary );
	pageobj.setWatchlist( Twinkle.getPref('watchWarnings') );
	
	//Find the right page
	var regex = new RegExp("\\|"+params.sanction+"=.*", "g");
	var results = Arb.topic_wikitext.match(regex);
	var sanction_area = results[1];
	sanction_area = sanction_area.replace("|" + params.sanction + "=", "");
	sanction_area = sanction_area.replace(/Wikipedia:.*\//, "");
	pageobj.setCallbackParameters( $.extend(params, {sanction_page: sanction_area, action: "blocked", calculate_date: true}) );
	pageobj.save(Twinkle.arb.callback.dslog);
};
Twinkle.arb();
})(jQuery);

})});
//</nowiki>
