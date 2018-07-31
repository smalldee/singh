import { Minister } from 'minister';
import { StoreObject } from 'store_object';
import { cmd, cmdCon } from 'utils';
import { Tap } from 'plugins/tap';
import { which } from 'shelljs';

export class Brew extends Minister
{
    private static instance: Brew;
    private constructor () { super(); }
    static getInstance ()
    {
        if ( !this.exist ) return;
        if ( !Brew.instance ) Brew.instance = new Brew();
        return Brew.instance;
    }

    static exist (): boolean
    {
        return !!which( `brew` );
    }

    dependancies: Minister[] = [ Tap.getInstance() ];

    getName () { return "Brew" }

    async install ( objs: StoreObject[] ): Promise<string | undefined>
    {
        let installList: string = '';
        await Promise.all( objs.map( obj => installList += `${ obj.id } ` ) );
        if ( installList )
        {
            return cmdCon( `HOMEBREW_NO_AUTO_UPDATE=1 brew install ${ installList } ` );
        }
    }

    async uninstall ( objs: StoreObject[] ): Promise<string | undefined>
    {
        let uninstallList: string = '';
        await Promise.all( objs.map( obj => uninstallList += `${ obj.id } ` ) );
        if ( uninstallList )
        {
            return cmdCon( `HOMEBREW_NO_AUTO_UPDATE=1 brew remove ${ uninstallList } ` );
        }
    }

    async version (): Promise<string>
    {
        return cmd( `HOMEBREW_NO_AUTO_UPDATE=1 brew --version` );
    }
    async list (): Promise<string>
    {
        return cmd( `HOMEBREW_NO_AUTO_UPDATE=1 brew list` );
    }

    async listLocalObjects (): Promise<StoreObject[]>
    {
        const list = await this.list();
        const instObjs: StoreObject[] = [];
        list.split( '\n' )
            .map( line =>
            {
                if ( line )
                {
                    instObjs.push( { id: line } as StoreObject );
                }
            }
            );
        return instObjs;
    }
}
