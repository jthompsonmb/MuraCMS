component extends="mura.bean.beanORM" table="tcontentremotepointer" entityname="remotecontentpointer" orderby="remoteurl asc"bundleable=true {
    property name="pointerid" fieldtype="id";
    property name="content" fieldtype="many-to-one" cfc="content" fkcolumn="contentid";
    property name="site" fieldtype="many-to-one" cfc="site" fkcolumn="siteID";
    property name="remoteid" fieldtype="index";
    property name="remoteurl" datatype="varchar" length="250";
    property name="created" ormtype="timestamp";

    private function getLoadSQL(){
        variables.loadSQLHasWhereClause=true;

        return "select tcontentremotepointer.*
            from tcontentremotepointer
            INNER JOIN tcontent on (
                    tcontentremotepointer.contentid=tcontent.contentid
                    and tcontentremotepointer.siteid=tcontent.siteid
                )
            where tcontent.active=1";
    }
}
