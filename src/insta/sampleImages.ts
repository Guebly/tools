/**
 * Sample images for quick demos
 * Using placeholder.com for reliable, fast loading
 */

export interface SampleImageSet {
  niche: string;
  images: string[];
}

export const SAMPLE_IMAGES: Record<string, string[]> = {
  fitness: [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1549476464-37392f717541?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=400&fit=crop",
  ],
  food: [
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&h=400&fit=crop",
  ],
  fashion: [
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1558769132-cb1aea1c8cf5?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=400&fit=crop",
  ],
  beauty: [
    "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1560869713-7d0a29430803?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1508186225823-0963cf9ab0de?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=400&fit=crop",
  ],
  architect: [
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600607688960-e799cf29c1ab?w=400&h=400&fit=crop",
  ],
  marketing: [
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=400&h=400&fit=crop",
  ],
};
