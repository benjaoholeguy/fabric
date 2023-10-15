/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class Asset {
  
    @Property()
    public docType?: string;

    // @Property()
    // public ID: string;

    @Property()
    public VIN: string;

    @Property()
    public Make: string;

    @Property()
    public Model: string;

    @Property()
    public Year: number;

    @Property()
    public Owner: string;

    @Property()
    public Accident?: number;

    @Property()
    public AppraisedValue: number;
}
