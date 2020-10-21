/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import React, { FunctionComponent, useState, useEffect, useContext, ReactNode } from "react";
import {
    IPublicClientApplication,
    AccountInfo,
    EventType,
    EventMessage
} from "@azure/msal-browser";
import { MsalContext, IMsalContext } from "./MsalContext";

export type MsalProviderProps = {
    instance: IPublicClientApplication;
    children?: ReactNode
};

export const MsalProvider: FunctionComponent<MsalProviderProps> = ({instance, children}: MsalProviderProps) => {
    // State hook to store accounts
    const [accounts, setAccounts] = useState<AccountInfo[]>(
        instance.getAllAccounts()
    );

    const [loginInProgress, setLoginInProgress] = useState<boolean>(false);

    useEffect(() => {
        const callbackId = instance.addEventCallback((message: EventMessage) => {
            switch (message.eventType) {
                case EventType.LOGIN_START:
                case EventType.SSO_SILENT_START:
                    setLoginInProgress(true);
                    break;
                case EventType.LOGIN_SUCCESS:
                case EventType.SSO_SILENT_SUCCESS:
                    setAccounts(instance.getAllAccounts());
                    setLoginInProgress(false);
                    break;
                case EventType.LOGIN_FAILURE:
                case EventType.SSO_SILENT_FAILURE:
                    setLoginInProgress(false);
                    break;
                case EventType.ACQUIRE_TOKEN_SUCCESS:
                case EventType.LOGOUT_SUCCESS:
                    setAccounts(instance.getAllAccounts());
                    break;
            }
        });

        return () => {
            callbackId && instance.removeEventCallback(callbackId);
        };
    }, [instance]);

    // Memoized context value
    const contextValue: IMsalContext = {
        instance,
        loginInProgress,
        accounts
    };

    return (
        <MsalContext.Provider value={contextValue}>
            {children}
        </MsalContext.Provider>
    );
};

export const useMsal = () => useContext(MsalContext);