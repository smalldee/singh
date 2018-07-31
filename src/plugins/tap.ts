import * as shell from 'shelljs';
import { Minister } from 'minister';
import { StoreObject } from 'store_object';
import { cmd, cmdCon } from 'utils';

export class Tap extends Minister
{
    private static instance: Tap;
    private constructor () { super(); }
    static getInstance ()
    {
        if ( !Tap.instance )
        {
            Tap.instance = new Tap();
        }
        return Tap.instance;
    }

    dependancies: Minister[] = [];

    getName () { return "Tap" }

    async install ( objs: StoreObject[] ): Promise<string | undefined>
    {
        let installList: string = '';
        await Promise.all( objs.map( obj => installList += `${ obj.id } ` ) );
        if ( installList )
            return cmdCon( `HOMEBREW_NO_AUTO_UPDATE=1 brew tap ${ installList } ` );
    }

    async uninstall ( objs: StoreObject[] ): Promise<string | undefined>
    {
        let uninstallList: string = '';
        await Promise.all( objs.map( obj => uninstallList += `${ obj.id } ` ) );
        if ( uninstallList )
            return cmdCon( `HOMEBREW_NO_AUTO_UPDATE=1 brew untap ${ uninstallList } ` );
    }

    async exist (): Promise<boolean>
    {
        return shell.which( `brew` ) != null;
    }
    version (): Promise<string>
    {
        return cmd( `HOMEBREW_NO_AUTO_UPDATE=1 brew --version` );
    }
    async list (): Promise<string>
    {
        return cmd( `HOMEBREW_NO_AUTO_UPDATE=1 brew tap` );
    }

    async listLocalObjects (): Promise<StoreObject[]>
    {
        const list = await this.list();
        let instObjs: StoreObject[] = [];
        list.split( '\n' )
            .map( line =>
            {
                if ( line )
                    instObjs.push( { id: line } as StoreObject );
            }
            );
        return instObjs;
    }
}