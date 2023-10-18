/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class Asset {
  
    @Property()
    public docType?: string;

    @Property()
    public product_id: string;

    @Property()
    public supplier_id: string;

    @Property()
    public part_name: string;

    @Property()
    public shipment_date?: string;

    @Property()
    public expected_shipment_date: string;

    @Property()
    public shipment_method_type: string;

    @Property()
    public longitude?: number;

    @Property()
    public latitude?: number;

    @Property()
    public quantity?: number;

    @Property()
    public appraisedValue: number;
}
