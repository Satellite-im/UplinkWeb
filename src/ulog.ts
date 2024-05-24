type LogLevel = 'info' | 'warning' | 'error' | 'debug';

class ULogClass {
    private static log(level: LogLevel, message?: any, ...optionalParams: any[]): void {
        const styles: { [key in LogLevel]: string } = {
            debug: 'color: blue;',
            warning: 'color: orange; font-weight: bold;',
            error: 'color: red; font-weight: bold; background-color: yellow;',
            info: 'color: green; font-weight: bold;'
        };

        const style = `${styles[level] || ''}`;
        console.log(`%c${message}`, optionalParams.length > 0 ? style : '', ...optionalParams)
    }

    static info(message?: any, ...optionalParams: any[]) {
        ULogClass.log('info', message, optionalParams);
    }

    static warning(message?: any, ...optionalParams: any[]) {
        ULogClass.log('warning', message, optionalParams);
    }

    static error(message?: any, ...optionalParams: any[]) {
        ULogClass.log('error', message, optionalParams);
    }

    static debug(message?: any, ...optionalParams: any[]) {
        const finalMessage = optionalParams.length > 0 ? `${message} ${optionalParams}` : message;
        ULogClass.log('debug', message, optionalParams);
    }
}

export const ULog = {
    info: ULogClass.info,
    warning: ULogClass.warning,
    error: ULogClass.error,
    debug: ULogClass.debug
};
