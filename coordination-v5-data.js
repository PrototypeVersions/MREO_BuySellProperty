(() => {
  "use strict";

  globalThis.MREO_COORDINATION_PROVIDERS = {
    title: [
      "Match me with a participating provider",
      "Northstar Title & Settlement · demonstration",
      "Meridian Closing Services · demonstration",
      "Lone Oak Title · demonstration"
    ],
    contractors: [
      "Match me with a participating provider",
      "Cedar Build & Rehab · demonstration",
      "Atlas Property Services · demonstration",
      "Redstone Restoration · demonstration"
    ],
    realtors: [
      "Match me with a participating provider",
      "MetroLine Realty Group · demonstration",
      "Northpoint Realty · demonstration",
      "Harbor Residential · demonstration"
    ],
    rentals: [
      "Match me with a participating provider",
      "KeyHouse Property Management · demonstration",
      "BlueDoor Residential Management · demonstration",
      "Oakline Property Services · demonstration"
    ]
  };

  globalThis.MREO_PROVIDER_DEMO_JOBS = [
    {
      id:"title-preston",
      service:"title",
      property:"2605 Preston Meadow Court, Plano, TX 75093",
      client:"Demo Buyer · Preston Acquisition LLC",
      provider:"Northstar Title & Settlement · demonstration",
      actionNeeded:true,
      status:"Review closing profile",
      summary:"Winning buyer has submitted vesting, funding, signing preference, and the connected auction record for preliminary title review.",
      meta:["Target closing · Oct 16","Cash purchase","Acquisition · $2,000,000"],
      task:"Review buyer closing profile and confirm that the file is ready for preliminary title work.",
      button:"Mark initial review complete",
      after:"Waiting for buyer identification and final signing instructions.",
      details:[
        ["Buyer / entity","Preston Acquisition LLC"],
        ["Vesting","Texas limited liability company"],
        ["Funding","Cash purchase"],
        ["Target closing","Oct 16, 2026"],
        ["Signing preference","Remote / electronic where permitted"],
        ["Connected records","Auction result, property information, buyer profile"]
      ]
    },
    {
      id:"title-maple",
      service:"title",
      property:"4218 Maple Ridge Drive, Dallas, TX 75229",
      client:"Demo Seller · Maple Ridge Holdings",
      provider:"Meridian Closing Services · demonstration",
      actionNeeded:false,
      status:"Waiting for seller payoff statement",
      summary:"Preliminary file review is complete. The title team is waiting on a seller-side payoff item before the closing package can be finalized.",
      meta:["Closing file open","Seller-side item pending","Acquisition · $385,000"],
      task:"No provider action is required until the seller payoff information arrives.",
      button:"",
      after:"",
      details:[
        ["Seller","Maple Ridge Holdings"],
        ["Buyer","Demo Buyer"],
        ["Winning amount","$385,000"],
        ["Current item","Seller payoff / lien confirmation"],
        ["Provider status","Waiting on client-side information"],
        ["Connected records","Auction result, title intake, property record"]
      ]
    },
    {
      id:"contractor-hickory",
      service:"contractors",
      property:"940 Hickory Grove Road, Denton, TX 76209",
      client:"Demo Buyer · Hickory Grove Properties",
      provider:"Cedar Build & Rehab · demonstration",
      actionNeeded:true,
      status:"Prepare rehabilitation estimate",
      summary:"Owner requests a rental-ready rehabilitation estimate covering flooring, paint, exterior trim, HVAC service, and final cleanup.",
      meta:["Budget target · $42,000","Vacant property","Requested · within 30 days"],
      task:"Review the scope, identify assumptions or exclusions, and prepare the contractor response.",
      button:"Mark estimate prepared",
      after:"Waiting for owner review and approval of the contractor proposal.",
      details:[
        ["Work category","Construction / rehabilitation"],
        ["Target budget","$42,000"],
        ["Desired timing","Within 30 days"],
        ["Access","Vacant · coordinated access"],
        ["Requested scope","Flooring, paint, exterior trim, HVAC service, cleanup"],
        ["Connected records","Property record, acquisition information, condition notes"]
      ]
    },
    {
      id:"contractor-brookfield",
      service:"contractors",
      property:"1709 Brookfield Drive, Allen, TX 75002",
      client:"Demo Owner · Brookfield Residential",
      provider:"Atlas Property Services · demonstration",
      actionNeeded:false,
      status:"Waiting for owner scope approval",
      summary:"Site review and preliminary scope were returned. The provider is waiting for the owner to approve the proposed work before scheduling.",
      meta:["Proposal · $18,750","12-day schedule","Owner approval pending"],
      task:"No provider action is required until the owner responds to the proposal.",
      button:"",
      after:"",
      details:[
        ["Proposal","$18,750"],
        ["Projected schedule","12 calendar days"],
        ["Scope","Paint, fixtures, flooring repair, turnover cleaning"],
        ["Property status","Vacant"],
        ["Client status","Reviewing provider response"],
        ["Connected records","Property record, photos, scope request"]
      ]
    },
    {
      id:"realtor-travis",
      service:"realtors",
      property:"3921 Travis Street Unit 204, Dallas, TX 75204",
      client:"Demo Owner · Travis Street Ventures",
      provider:"MetroLine Realty Group · demonstration",
      actionNeeded:true,
      status:"Review rental market positioning",
      summary:"Owner requests a rent recommendation, leasing strategy, photography plan, and proposed representation terms for a recently acquired condo.",
      meta:["Dallas · Uptown","Rental launch","Photography requested"],
      task:"Review the property record and prepare the recommended positioning and representation package.",
      button:"Mark market package prepared",
      after:"Waiting for owner approval of the representation package.",
      details:[
        ["Service requested","Rental market positioning and leasing representation"],
        ["Target outcome","High-quality rental launch"],
        ["Market","Dallas · Uptown"],
        ["Property type","Condominium"],
        ["Requested support","Pricing, photography, listing, showings, leasing"],
        ["Connected records","Acquisition record, property details, improvement closeout"]
      ]
    },
    {
      id:"realtor-vineyard",
      service:"realtors",
      property:"805 Vineyard Crossing, Grapevine, TX 76051",
      client:"Demo Seller · Vineyard Crossing LLC",
      provider:"Northpoint Realty · demonstration",
      actionNeeded:false,
      status:"Waiting for listing signatures",
      summary:"Pricing and marketing recommendations have been delivered. The brokerage is waiting for the client to sign the fictional representation package.",
      meta:["Seller representation","List target · $625,000","Client signature pending"],
      task:"No provider action is required until the signed representation package returns.",
      button:"",
      after:"",
      details:[
        ["Service requested","Seller representation / conventional listing"],
        ["Recommended list target","$625,000"],
        ["Marketing plan","Photography, digital launch, showings, weekly reporting"],
        ["Engagement","90-day demonstration term"],
        ["Current status","Waiting for client signature"],
        ["Connected records","Property packet, seller profile, pricing analysis"]
      ]
    },
    {
      id:"rental-meridian",
      service:"rentals",
      property:"5016 Meridian Place, Addison, TX 75001",
      client:"Demo Owner · Meridian Residential",
      provider:"KeyHouse Property Management · demonstration",
      actionNeeded:true,
      status:"Review rent-ready packet",
      summary:"Owner requests tenant placement plus ongoing management. The property record includes acquisition details and contractor closeout information.",
      meta:["Target rent · $3,150/mo","Available · Nov 15","Full management requested"],
      task:"Confirm rental readiness and prepare the leasing and property-management response.",
      button:"Mark management package prepared",
      after:"Waiting for owner approval of leasing and management terms.",
      details:[
        ["Rental pathway","Find tenant + ongoing property management"],
        ["Target monthly rent","$3,150"],
        ["Availability","Nov 15, 2026"],
        ["Screening","Standard income, rental-history, credit/background where lawful"],
        ["Management","Rent collection, maintenance, reporting, renewals"],
        ["Connected records","Acquisition record, contractor closeout, property information"]
      ]
    },
    {
      id:"rental-lakeview",
      service:"rentals",
      property:"2317 Lakeview Terrace, Lewisville, TX 75067",
      client:"Demo Owner · Lakeview Property Co.",
      provider:"BlueDoor Residential Management · demonstration",
      actionNeeded:false,
      status:"Waiting for applicant screening authorization",
      summary:"A tenant-placement workflow is underway. The manager is waiting for owner authorization before moving the selected applicant into final screening.",
      meta:["Target rent · $2,700/mo","Applicant selected","Owner authorization pending"],
      task:"No provider action is required until the owner authorizes final applicant screening.",
      button:"",
      after:"",
      details:[
        ["Rental pathway","Find tenant only"],
        ["Target monthly rent","$2,700"],
        ["Applicant stage","Pre-screen complete"],
        ["Current item","Owner screening authorization"],
        ["Lease target","12 months"],
        ["Connected records","Property record, rental criteria, application summary"]
      ]
    }
  ];
})();