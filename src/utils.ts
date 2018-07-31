import { exec } from 'shelljs';
import pify from 'pify';
import { StoreObject } from 'store_object';
import outdent from 'outdent';

export async function cmd ( cmd: string ): Promise<string> 
{
    return pify( exec, { multiArgs: true } )( cmd, { silent: true, async: true } )
        .then( data => data[ 0 ] );
}

export async function cmdCon ( cmd: string ): Promise<string> 
{
    return pify( exec, { multiArgs: true } )( cmd, { silent: false, async: true } )
        .then( data => data[ 0 ] );
}

export async function deltaObject
    ( x: StoreObject[], y: StoreObject[] ): Promise<StoreObject[]> 
{
    let delta: StoreObject[] = [];
    await Promise.all
        (
        x.map( async x_obj =>
        {
            if ( !y.find( y_obj => y_obj.id === x_obj.id ) )
            {
                delta.push( x_obj );
            }
        }
        )
        );
    return delta;
}

export function listFromStoreObjects ( storeObjects: StoreObject[] ): string
{
    let list = '';
    storeObjects.map
        (
        storeObject =>
            list += `${ storeObject.alias ? storeObject.alias : storeObject.id }, `
        );
    list = list.substr( 0, list.length - 2 );
    return list;
}

export function printTitle ( title: string )
{
    const char: string = '*';
    console.log( outdent
        `
        ${ outdent }
        
        ${ char.repeat( title.length + 4 ) }
        ${char } ${ title } ${ char }
        ${char.repeat( title.length + 4 ) }
        
        `
    );

}
