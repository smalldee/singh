#!/usr/bin/env node

import yargs from 'yargs';

import { Lord } from 'lord';
import { printTitle } from 'utils';

printTitle( 'Lord of Apps' );

async function main ()
{
    const lord = Lord.getInstance();
    const argv = yargs
        .command( 'list', '' )
        .command( 'push', '' )
        .command( 'pull', '' )
        .command( 'backup', '' )
        .command( 'restore', '' )
        .command( 'versions', '' ).argv;
    // console.log( argv );

    switch ( argv._[ 0 ] )
    {
        case 'versions':
            lord.versions();
            break;

        case 'diff':
            lord.diff();
            break;

        case 'list':
            lord.list();
            break;

        case 'store':
            lord.store();
            break;

        case 'push':
            lord.push();
            break;

        case 'pull':
            lord.pull();
            break;

        case 'backup':
            lord.backup();
            break;

        case 'restore':
            lord.restore();
            break;

        default:
            console.log( '\nMy Lord!!! Please HEL:P\n' );
            yargs.showHelp();
            break;
    }
    return;
}

main();
