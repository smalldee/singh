import * as shell from 'shelljs';
import { Minister } from 'minister';
import { StoreObject } from 'store_object';
import { cmd, cmdCon } from 'utils';

export class Mas extends Minister
{
    private static instance: Mas;
    private constructor () { super(); }
    static getInstance ()
    {
        if ( !Mas.instance )
        {
            Mas.instance = new Mas();
        }
        return Mas.instance;
    }

    dependancies: Minister[] = [];

    getName () { return "Mas" }

    async exist (): Promise<boolean>
    {
        return shell.which( `mas` ) != undefined;
    }


    async install ( objs: StoreObject[] ): Promise<string | undefined>
    {
        let installList: string = '';
        await Promise.all( objs.map( obj => installList += `${ obj.id } ` ) );
        if ( installList )
            return cmdCon( `mas install ${ installList } ` );
    }

    async uninstall ( objs: StoreObject[] ): Promise<string | undefined>
    {
        let uninstallList: string = '';
        await Promise.all( objs.map( obj => uninstallList += `${ obj.id } ` ) );
        if ( uninstallList )
            return cmdCon( `mas remove ${ uninstallList } ` );
    }

    async version (): Promise<string>
    {
        return cmd( `mas version` );
    }
    async list (): Promise<string>
    {
        return cmd( `mas list` );
    }

    async listLocalObjects (): Promise<StoreObject[]>
    {
        const list = await this.list()
        const lines = list.split( '\n' );
        lines.pop();
        return Array.from(
            lines,
            line =>
            {
                const index = line.indexOf( ' ' );
                return { id: line.substr( 0, index ), alias: line.substr( index + 1 ) } as StoreObject;
            } );
    }
}