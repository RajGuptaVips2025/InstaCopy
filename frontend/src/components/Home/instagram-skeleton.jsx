// "use client"

// import { motion } from "framer-motion"
// import { Skeleton } from "@/components/ui/skeleton"

// export function InstagramSkeletonComponent() {
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     show: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.15,
//       },
//     },
//   }

//   const itemVariants = {
//     hidden: { opacity: 0, y: 10 },
//     show: { opacity: 1, y: 0 },
//   }

//   return (
//     <motion.div
//       variants={containerVariants}
//       initial="hidden"
//       animate="show"
//       className="max-w-lg mx-auto dark:bg-neutral-950"
//     >
//       {[...Array(2)].map((_, i) => (
//         <motion.div key={i} variants={itemVariants} className="pb-4 mb-4">
//           {/* Post header */}
//           <div className="flex items-center space-x-2 py-2">
//             <Skeleton className="h-10 w-10 rounded-full" />
//             <div className="flex flex-col gap-2">
//               <Skeleton className="h-2 w-44 rounded-full" />
//               <Skeleton className="h-2 w-24 rounded-full" />
//             </div>
//           </div>

//           {/* Post image */}
//           <Skeleton className="h-[80vh] w-full" />

//           {/* Post actions */}
//           <div className="flex justify-between items-center">
//             <div className="flex items-center space-x-4 py-2">
//               <Skeleton className="h-6 w-6 rounded-lg" />
//               <Skeleton className="h-6 w-6 rounded-lg" />
//               <Skeleton className="h-6 w-6 rounded-lg" />
//             </div>
//             <Skeleton className="h-6 w-6 rounded-lg" />
//           </div>

//           {/* Likes */}
//           <div className="py-2">
//             <Skeleton className="h-4 w-28" />
//           </div>

//           {/* Caption */}
//           <div>
//             <Skeleton className="h-4 w-3/4" />
//           </div>

//           {/* Comments */}
//           <div className="mt-2">
//             <Skeleton className="h-4 w-full" />
//           </div>
//         </motion.div>
//       ))}
//     </motion.div>
//   )
// }
















"'use client'"

import { Skeleton } from "@/components/ui/skeleton"

export function InstagramSkeletonComponent() {
  return (
    (<div className="max-w-lg mx-auto dark:bg-neutral-950">
      {/* Header */}
      {/* Posts */}
      {[...Array(2)].map((_, i) => (
        <div key={i} className=" pb-4 mb-4">
          {/* Post header */}
          <div className="flex items-center space-x-2 py-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-2 w-44 rounded-full" />
              <Skeleton className="h-2 w-24 rounded-full" />
            </div>
          </div>

          {/* Post image */}
          <Skeleton className="h-[80vh] w-full" />

          {/* Post actions */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 py-2">
              <Skeleton className="h-6 w-6 rounded-lg" />
              <Skeleton className="h-6 w-6 rounded-lg" />
              <Skeleton className="h-6 w-6 rounded-lg" />
            </div>
            <Skeleton className="h-6 w-6 rounded-lg" />
          </div>

          {/* Likes */}
          <div className=" py-2">
            <Skeleton className="h-4 w-28" />
          </div>

          {/* Caption */}
          <div className="">
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Comments */}
          <div className=" mt-2">
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>)
  );
}