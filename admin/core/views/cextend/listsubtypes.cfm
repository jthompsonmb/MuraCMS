<!--- This file is part of Mura CMS.

Mura CMS is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, Version 2 of the License.

Mura CMS is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Mura CMS. If not, see <http://www.gnu.org/licenses/>.

Linking Mura CMS statically or dynamically with other modules constitutes the preparation of a derivative work based on
Mura CMS. Thus, the terms and conditions of the GNU General Public License version 2 ("GPL") cover the entire combined work.

However, as a special exception, the copyright holders of Mura CMS grant you permission to combine Mura CMS with programs
or libraries that are released under the GNU Lesser General Public License version 2.1.

In addition, as a special exception, the copyright holders of Mura CMS grant you permission to combine Mura CMS with
independent software modules (plugins, themes and bundles), and to distribute these plugins, themes and bundles without
Mura CMS under the license of your choice, provided that you follow these specific guidelines:

Your custom code

• Must not alter any default objects in the Mura CMS database and
• May not alter the default display of the Mura CMS logo within Mura CMS and
• Must not alter any files in the following directories.

 /admin/
 /tasks/
 /config/
 /requirements/mura/
 /Application.cfc
 /index.cfm
 /MuraProxy.cfc

You may copy and distribute Mura CMS with a plug-in, theme or bundle that meets the above guidelines as a combined work
under the terms of GPL for Mura CMS, provided that you include the source code of that other code when and as the GNU GPL
requires distribution of source code.

For clarity, if you create a modified version of Mura CMS, you are not obligated to grant this special exception for your
modified version; it is your choice whether to do so, or to make such modified version available under the GNU General Public License
version 2 without this exception.  You may, if you choose, apply this exception to your own modified versions of Mura CMS.
--->
<cfoutput>
	<cfset rslist=application.classExtensionManager.getSubTypes(siteID=rc.siteID,activeOnly=false) />

<div class="mura-header">
	<h1>#rc.$.rbKey('sitemanager.extension.classextensionmanager')#</h1>

	<div class="nav-module-specific btn-group">
		<a class="btn" href="#rc.$.globalConfig('context')#/admin/?muraAction=cExtend.editSubType&amp;subTypeID=&amp;siteid=#esapiEncode('url',rc.siteid)#">
					<i class="mi-plus-circle"></i>
			#rc.$.rbKey('sitemanager.extension.addclassextension')#
		</a>

		<!--- Actions --->
		<div class="btn-group">
			<a class="btn dropdown-toggle" data-toggle="dropdown" href="##">
						<i class="mi-cogs"></i>
				#rc.$.rbKey('sitemanager.extension.actions')#
				<span class="caret"></span>
			</a>
			<ul class="dropdown-menu">
				<cfif rslist.recordcount>
					<li>
						<a href="#rc.$.globalConfig('context')#/admin/?muraAction=cExtend.exportSubType&amp;siteid=#esapiEncode('url',rc.siteid)#">
									<i class="mi-sign-out"></i>
							#rc.$.rbKey('sitemanager.extension.export')#
						</a>
					</li>
				</cfif>
				<li>
					<a href="#rc.$.globalConfig('context')#/admin/?muraAction=cExtend.importSubTypes&amp;siteid=#esapiEncode('url',rc.siteid)#">
								<i class="mi-sign-in"></i>
						#rc.$.rbKey('sitemanager.extension.import')#
					</a>
				</li>
			</ul>
		</div>
		<!--- /Actions --->
	</div>

</div> <!-- /.mura-header -->
</cfoutput>

<div class="block block-constrain">
		<div class="block block-bordered">
		  <div class="block-content">
			<table class="mura-table-grid">

	<cfif rslist.recordcount>
	<tbody>

			<cfoutput>
				<thead>
					<tr>
						<th class="actions"></th>
						<th>
							#rc.$.rbKey('sitemanager.extension.icon')#
						</th>
						<th class="title">
							#rc.$.rbKey('sitemanager.extension.classextension')#
						</th>
						<th class="var-width">
							#rc.$.rbKey('sitemanager.extension.description')#
						</th>
						<th>
							#rc.$.rbKey('sitemanager.extension.active')#
						</th>
					</tr>
				</thead>
			</cfoutput>
			<cfoutput query="rslist">
				<tr>
					<td class="actions">
						<a class="show-actions" href="javascript:;" ontouchstart="this.onclick();" onclick="showTableControls(this);"><i class="mi-ellipsis-v"></i></a>
						<div class="actions-menu hide">
							<ul class="actions-list">
								<li class="edit">
									<a href="#rc.$.globalConfig('context')#/admin/?muraAction=cExtend.editSubType&amp;subTypeID=#rslist.subTypeID#&amp;siteid=#esapiEncode('url',rc.siteid)#"><i class="mi-pencil"></i>#rc.$.rbKey('sitemanager.extension.edit')#</a>
								</li>
								<li class="view-sets">
									<a href="#rc.$.globalConfig('context')#/admin/?muraAction=cExtend.listSets&amp;subTypeID=#rslist.subTypeID#&amp;siteid=#esapiEncode('url',rc.siteid)#"><i class="mi-list-alt"></i>#rc.$.rbKey('sitemanager.extension.viewsets')#</a>
								</li>
							</ul>
						</div>
					</td>
					<td class="selected-icon">
						<a href="#rc.$.globalConfig('context')#/admin/?muraAction=cExtend.listSets&amp;subTypeID=#rslist.subTypeID#&amp;siteid=#esapiEncode('url',rc.siteid)#">
							<i class="#application.classExtensionManager.getIconClass(rslist.type,rslist.subtype,rslist.siteid)#" style="font-size:14px;"></i>
						</a>
					</td>
					<td class="title">
						<a title="#rc.$.rbKey('sitemanager.extension.edit')#" href="#rc.$.globalConfig('context')#/admin/?muraAction=cExtend.listSets&amp;subTypeID=#rslist.subTypeID#&amp;siteid=#esapiEncode('url',rc.siteid)#">
							#application.classExtensionManager.getTypeAsString(rslist.type)# / #rslist.subtype#
						</a>
					</td>
					<td class="var-width">
						#esapiEncode('html', rslist.description)#
					</td>
					<td>
						#YesNoFormat(rslist.isactive)#
					</td>
				</tr>
			</cfoutput>
		</tbody>
		</table>
		<cfelse>
			<div class="help-block-empty"><cfoutput>#rc.$.rbKey('sitemanager.extension.nosubtypes')#</cfoutput></div>
		</cfif>


			</div> <!-- /.block-content -->
	</div> <!-- /.block-bordered -->
</div> <!-- /.block-constrain -->
